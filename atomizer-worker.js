class AtomizerWorker {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.srcCanvas = new OffscreenCanvas(1, 1);
        this.srcCtx = this.srcCanvas.getContext("2d", { willReadFrequently: true });

        this.particleGap = 0;
        this.particleSize = 2;
        this.offsetX = 0;
        this.offsetY = 0;
        this.monochrome = false;
        this.monochromeColor = "#fff";
        this.mouseForce = 4000;
        this.restless = false;
        this.timeScale = 1;
        this.enablePerfLog = false;
        this.perfLogInterval = 120;

        Object.assign(this, options);

        this.monochromeColorArr = this.parseColor(this.monochromeColor);
        this.mx = -1;
        this.my = -1;
        this.cw = 0;
        this.ch = 0;
        this.frame = 0;
        this.hasInitialized = false;
        this.isRunning = false;
        this.rafId = null;
        this.lastTimestamp = null;
        this.baseFrameDuration = 1000 / 60;
        this.perfFrameCount = 0;
        this.perfAccumulatedMs = 0;
        this.perfAccumulatedDrawMs = 0;
        this.perfLastLog = null;

        this.imageBitmap = null;
        this.imageData = null;
        this.imageDataWidth = 0;
        this.imageDataHeight = 0;
        this.imageData32 = null;

        this.capacity = 0;
        this.activeCount = 0;
        this.posX = new Float32Array(0);
        this.posY = new Float32Array(0);
        this.velX = new Float32Array(0);
        this.velY = new Float32Array(0);
        this.gravityX = new Float32Array(0);
        this.gravityY = new Float32Array(0);
        this.ttl = new Float32Array(0);
        this.colorPacked = new Uint32Array(0);
        this.colorIsFunc = new Uint8Array(0);
        this.colorFuncs = [];

        this.isLittleEndian = this.detectLittleEndian();
        if (!this.isLittleEndian) {
            console.warn("AtomizerWorker: Packed draw path expects little-endian byte order.");
        }

        this.nextFrame = this.nextFrame.bind(this);
    }

    detectLittleEndian() {
        const buffer = new ArrayBuffer(4);
        const view32 = new Uint32Array(buffer);
        const view8 = new Uint8Array(buffer);
        view32[0] = 0x0a0b0c0d;
        return view8[0] === 0x0d;
    }

    requestAnimationFrame(callback) {
        if (typeof self.requestAnimationFrame === "function") {
            return self.requestAnimationFrame(callback);
        }
        return setTimeout(() => callback(performance.now()), 1000 / 60);
    }

    cancelAnimationFrame(id) {
        if (typeof self.cancelAnimationFrame === "function") {
            self.cancelAnimationFrame(id);
        } else {
            clearTimeout(id);
        }
    }

    packColor(color) {
        return ((color[3] & 0xff) << 24) | ((color[2] & 0xff) << 16) | ((color[1] & 0xff) << 8) | (color[0] & 0xff);
    }

    parseColor(color) {
        let result;
        color = color.replace(" ", "");

        if (result = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)) {
            result = [
                parseInt(result[1], 16),
                parseInt(result[2], 16),
                parseInt(result[3], 16)
            ];
        } else if (result = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)) {
            result = [
                parseInt(result[1], 16) * 17,
                parseInt(result[2], 16) * 17,
                parseInt(result[3], 16) * 17
            ];
        } else if (result = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)) {
            result = [+result[1], +result[2], +result[3], +result[4]];
        } else if (result = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)) {
            result = [+result[1], +result[2], +result[3]];
        } else {
            return null;
        }

        if (isNaN(result[3])) {
            result[3] = 1;
        }
        result[3] *= 255;

        return result;
    }

    ensureCapacity(required) {
        if (required <= this.capacity) {
            return;
        }
        const newCapacity = Math.max(required, this.capacity ? this.capacity * 2 : 256);
        const posX = new Float32Array(newCapacity);
        const posY = new Float32Array(newCapacity);
        const velX = new Float32Array(newCapacity);
        const velY = new Float32Array(newCapacity);
        const gravityX = new Float32Array(newCapacity);
        const gravityY = new Float32Array(newCapacity);
        const ttl = new Float32Array(newCapacity);
        const colorPacked = new Uint32Array(newCapacity);
        const colorIsFunc = new Uint8Array(newCapacity);
        const colorFuncs = new Array(newCapacity);

        posX.set(this.posX);
        posY.set(this.posY);
        velX.set(this.velX);
        velY.set(this.velY);
        gravityX.set(this.gravityX);
        gravityY.set(this.gravityY);
        ttl.set(this.ttl);
        colorPacked.set(this.colorPacked);
        colorIsFunc.set(this.colorIsFunc);
        for (let i = 0; i < this.colorFuncs.length; i++) {
            colorFuncs[i] = this.colorFuncs[i];
        }

        this.posX = posX;
        this.posY = posY;
        this.velX = velX;
        this.velY = velY;
        this.gravityX = gravityX;
        this.gravityY = gravityY;
        this.ttl = ttl;
        this.colorPacked = colorPacked;
        this.colorIsFunc = colorIsFunc;
        this.colorFuncs = colorFuncs;
        this.capacity = newCapacity;
    }

    shufflePixels(pixels) {
        for (let i = pixels.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = pixels[i];
            pixels[i] = pixels[j];
            pixels[j] = temp;
        }
    }

    getPixelFromImageData(imageData, offsetX, offsetY) {
        const pixels = [];

        for (let x = 0; x < imageData.width; x += this.particleGap + this.particleSize) {
            for (let y = 0; y < imageData.height; y += this.particleGap + this.particleSize) {
                const pixelIndex = (y * imageData.width + x) * 4;
                const alpha = imageData.data[pixelIndex + 3];

                if (alpha > 0) {
                    pixels.push({
                        x: offsetX + x,
                        y: offsetY + y,
                        color: this.monochrome === true
                            ? [this.monochromeColorArr[0], this.monochromeColorArr[1], this.monochromeColorArr[2], this.monochromeColorArr[3]]
                            : [imageData.data[pixelIndex], imageData.data[pixelIndex + 1], imageData.data[pixelIndex + 2], imageData.data[pixelIndex + 3]],
                    });
                }
            }
        }

        return pixels;
    }

    setImageBitmap(bitmap) {
        this.imageBitmap = bitmap;
    }

    setPointer(x, y) {
        this.mx = x;
        this.my = y;
    }

    clearPointer() {
        this.mx = -1;
        this.my = -1;
    }

    setColor(color) {
        this.monochromeColorArr = this.parseColor(color);
    }

    resize(width, height) {
        this.cw = width;
        this.ch = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.imageData = null;
        this.imageDataWidth = 0;
        this.imageDataHeight = 0;
        this.imageData32 = null;
        this.init();
    }

    init() {
        if (!this.imageBitmap) {
            return;
        }
        this.srcCanvas.width = this.imageBitmap.width;
        this.srcCanvas.height = this.imageBitmap.height;
        this.srcCtx.clearRect(0, 0, this.srcCanvas.width, this.srcCanvas.height);
        this.srcCtx.drawImage(this.imageBitmap, 0, 0);

        const pixels = this.getPixelFromImageData(
            this.srcCtx.getImageData(0, 0, this.srcCanvas.width, this.srcCanvas.height),
            ~~((this.cw / 2) - (this.srcCanvas.width / 2)),
            ~~((this.ch / 2) - (this.srcCanvas.height / 2)),
        );

        this.shufflePixels(pixels);

        const targetCount = pixels.length;
        if (targetCount > this.capacity) {
            this.ensureCapacity(targetCount);
        }
        if (targetCount > this.activeCount) {
            for (let i = this.activeCount; i < targetCount; i++) {
                this.posX[i] = Math.random() * this.cw;
                this.posY[i] = Math.random() * this.ch;
                this.velX[i] = Math.random() * 10;
                this.velY[i] = Math.random() * 10;
                this.ttl[i] = -1;
                this.colorIsFunc[i] = 0;
                this.colorFuncs[i] = null;
            }
        }
        this.activeCount = Math.max(this.activeCount, targetCount);

        for (let i = 0; i < targetCount; i++) {
            const color = pixels[i].color;
            this.ttl[i] = -1;
            this.gravityX[i] = pixels[i].x;
            this.gravityY[i] = pixels[i].y;
            if (typeof color === "function") {
                this.colorIsFunc[i] = 1;
                this.colorFuncs[i] = color;
                const resolved = color();
                this.colorPacked[i] = resolved ? this.packColor(resolved) : 0;
            } else {
                this.colorIsFunc[i] = 0;
                this.colorFuncs[i] = null;
                this.colorPacked[i] = this.packColor(color);
            }
        }

        for (let i = targetCount; i < this.activeCount; i++) {
            this.ttl[i] = ~~(Math.random() * 10);
            this.gravityY[i] = ~~(this.ch * Math.random());
            this.gravityX[i] = ~~(this.cw * Math.random());
        }

        if (!this.hasInitialized) {
            self.postMessage({ type: "initialized" });
        }
        this.hasInitialized = true;
    }

    nextFrame(timestamp) {
        if (!this.isRunning) {
            return;
        }
        if (typeof timestamp !== "number") {
            timestamp = performance.now();
        }
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp - this.baseFrameDuration;
        }
        const deltaMs = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        const timeStep = (deltaMs / this.baseFrameDuration) * this.timeScale;
        this.dampingFactor = Math.pow(0.90, timeStep);
        const frameStart = this.enablePerfLog ? performance.now() : 0;

        const posX = this.posX;
        const posY = this.posY;
        const velX = this.velX;
        const velY = this.velY;
        const gravityX = this.gravityX;
        const gravityY = this.gravityY;
        const ttl = this.ttl;
        const colorIsFunc = this.colorIsFunc;
        const colorFuncs = this.colorFuncs;
        const mouseX = this.mx;
        const mouseY = this.my;
        const hasMouse = mouseX >= 0 && this.mouseForce;
        const baseForce = 0.008;
        let i = 0;
        while (i < this.activeCount) {
            if (ttl[i] >= 0) {
                ttl[i] -= timeStep;
                if (ttl[i] <= 0) {
                    const last = this.activeCount - 1;
                    if (i !== last) {
                        posX[i] = posX[last];
                        posY[i] = posY[last];
                        velX[i] = velX[last];
                        velY[i] = velY[last];
                        gravityX[i] = gravityX[last];
                        gravityY[i] = gravityY[last];
                        ttl[i] = ttl[last];
                        this.colorPacked[i] = this.colorPacked[last];
                        colorIsFunc[i] = colorIsFunc[last];
                        colorFuncs[i] = colorFuncs[last];
                    }
                    this.activeCount = last;
                    continue;
                }
            }

            const dx = gravityX[i] - posX[i];
            const dy = gravityY[i] - posY[i];
            const distanceSq = dx * dx + dy * dy;
            let forceX = 0;
            let forceY = 0;

            if (this.restless === true) {
                const distance = Math.sqrt(distanceSq) || 1;
                const jitter = Math.random() * 0.1 - 0.05;
                const invDistance = 1 / distance;
                forceX = dx * baseForce + dx * invDistance * jitter;
                forceY = dy * baseForce + dy * invDistance * jitter;
            } else if (distanceSq < 1.5625) {
                posX[i] = gravityX[i] + 0.25;
                posY[i] = gravityY[i] + 0.25;
            }

            let mouseForce = 0;
            let mouseDx = 0;
            let mouseDy = 0;
            let mouseInvDistance = 0;
            let mouseScale = 1;

            if (hasMouse) {
                mouseDx = posX[i] - mouseX;
                mouseDy = posY[i] - mouseY;
                const mouseDistanceSq = mouseDx * mouseDx + mouseDy * mouseDy;
                if (mouseDistanceSq > 0.0001) {
                    mouseForce = Math.min(this.mouseForce / mouseDistanceSq, this.mouseForce);
                    mouseInvDistance = 1 / Math.sqrt(mouseDistanceSq);
                }
                if (colorIsFunc[i]) {
                    mouseScale = -1;
                    mouseForce *= 0.001 + Math.random() * 0.1 - 0.05;
                }
            }

            if (forceX === 0 && forceY === 0 && distanceSq >= 1.5625) {
                forceX = dx * baseForce;
                forceY = dy * baseForce;
            }
            if (mouseInvDistance > 0) {
                forceX += mouseForce * mouseScale * mouseDx * mouseInvDistance;
                forceY += mouseForce * mouseScale * mouseDy * mouseInvDistance;
            }

            velX[i] += forceX * timeStep;
            velY[i] += forceY * timeStep;
            velX[i] *= this.dampingFactor;
            velY[i] *= this.dampingFactor;
            posX[i] += velX[i];
            posY[i] += velY[i];
            i += 1;
        }

        const drawStart = this.enablePerfLog ? performance.now() : 0;
        this.drawParticles();
        const drawEnd = this.enablePerfLog ? performance.now() : 0;

        if (this.enablePerfLog) {
            const frameEnd = performance.now();
            this.perfFrameCount += 1;
            this.perfAccumulatedMs += frameEnd - frameStart;
            this.perfAccumulatedDrawMs += drawEnd - drawStart;
            if (!this.perfLastLog) {
                this.perfLastLog = frameEnd;
            }
            if (this.perfFrameCount >= this.perfLogInterval) {
                const avgFrameMs = this.perfAccumulatedMs / this.perfFrameCount;
                const avgDrawMs = this.perfAccumulatedDrawMs / this.perfFrameCount;
                const fps = 1000 / avgFrameMs;
                console.log(
                    "AtomizerWorker perf:",
                    `frames=${this.perfFrameCount}`,
                    `avgFrameMs=${avgFrameMs.toFixed(2)}`,
                    `avgDrawMs=${avgDrawMs.toFixed(2)}`,
                    `fps=${fps.toFixed(1)}`
                );
                this.perfFrameCount = 0;
                this.perfAccumulatedMs = 0;
                this.perfAccumulatedDrawMs = 0;
                this.perfLastLog = frameEnd;
            }
        }

        if (this.isRunning) {
            this.rafId = this.requestAnimationFrame(this.nextFrame);
        }
    }

    drawParticles() {
        if (!this.imageData || this.imageDataWidth !== this.cw || this.imageDataHeight !== this.ch) {
            this.imageData = this.ctx.createImageData(this.cw, this.ch);
            this.imageDataWidth = this.cw;
            this.imageDataHeight = this.ch;
            this.imageData32 = null;
        }
        const imageData = this.imageData;
        const data = imageData.data;
        if (!this.imageData32) {
            this.imageData32 = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4);
        }
        const data32 = this.imageData32;
        data32.fill(0);
        let x, y, pixelX, pixelY;
        const posX = this.posX;
        const posY = this.posY;
        const colorPacked = this.colorPacked;

        for (let i = 0; i < this.activeCount; i++) {
            x = ~~posX[i];
            y = ~~posY[i];

            let startX = x;
            let startY = y;
            let endX = x + this.particleSize;
            let endY = y + this.particleSize;
            if (startX < 0) startX = 0;
            if (startY < 0) startY = 0;
            if (endX > this.cw) endX = this.cw;
            if (endY > this.ch) endY = this.ch;

            if (startX < endX && startY < endY) {
                const packed = colorPacked[i];
                const width = imageData.width;
                for (pixelY = startY; pixelY < endY; pixelY++) {
                    let rowIndex = pixelY * width + startX;
                    for (pixelX = startX; pixelX < endX; pixelX++) {
                        data32[rowIndex++] = packed;
                    }
                }
            }
        }

        this.ctx.putImageData(imageData, this.offsetX, this.offsetY);
    }

    play() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.lastTimestamp = null;
        this.rafId = this.requestAnimationFrame(this.nextFrame);
    }

    pause() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.rafId !== null) {
            this.cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.lastTimestamp = null;
    }

    destroy() {
        this.pause();
        this.imageBitmap = null;
    }
}

let atomizer = null;

self.onmessage = (event) => {
    const data = event.data || {};
    switch (data.type) {
        case "init": {
            atomizer = new AtomizerWorker(data.canvas, data.options || {});
            atomizer.resize(data.width, data.height);
            if (data.imageBitmap) {
                atomizer.setImageBitmap(data.imageBitmap);
                atomizer.init();
            }
            break;
        }
        case "setImage": {
            if (atomizer && data.imageBitmap) {
                atomizer.setImageBitmap(data.imageBitmap);
            }
            break;
        }
        case "resize": {
            if (atomizer) {
                atomizer.resize(data.width, data.height);
            }
            break;
        }
        case "initParticles": {
            if (atomizer) {
                atomizer.init();
            }
            break;
        }
        case "play": {
            if (atomizer) {
                atomizer.play();
            }
            break;
        }
        case "pause": {
            if (atomizer) {
                atomizer.pause();
            }
            break;
        }
        case "pointer": {
            if (atomizer) {
                atomizer.setPointer(data.x, data.y);
            }
            break;
        }
        case "pointerOut": {
            if (atomizer) {
                atomizer.clearPointer();
            }
            break;
        }
        case "setColor": {
            if (atomizer) {
                atomizer.setColor(data.color);
            }
            break;
        }
        case "destroy": {
            if (atomizer) {
                atomizer.destroy();
                atomizer = null;
            }
            break;
        }
        default:
            break;
    }
};
