class ImageAtomizer {
    constructor(imageSrc, options) {
        // Default properties
        this.elementId = "image-atomizer";
        this.width = 0;
        this.height = 0;
        this.particleGap = 0;
        this.particleSize = 2;
        this.offsetX = 0;
        this.offsetY = 0;
        this.monochrome = false;
        this.monochromeColor = "#fff";
        this.mouseForce = 4000;
        this.restless = false;
        this.timeScale = 1;
        this.onWidthChange = null;
        this.onHeightChange = null;
        this.onSizeChange = null;
        this.onInitialized = null;
        this.isRunning = false;
        this.rafId = null;
        this.enablePerfLog = false;
        this.perfLogInterval = 120;
        this.enableOffscreenWorker = false;
        this.imageData = null;
        this.imageDataWidth = 0;
        this.imageDataHeight = 0;
        this.imageData32 = null;
        this.isLittleEndian = null;
        this.useWorker = false;
        this.worker = null;
        this.offscreenCanvas = null;
        this.resizeObserver = null;

        this.nextFrame = this.nextFrame.bind(this);
        
        // Apply custom options
        if (options) {
            const optionKeys = [
                'elementId', 'width', 'height', 'particleGap', 'particleSize', 'monochrome', 'monochromeColor',
                'mouseForce', 'restless', 'onWidthChange', 'onHeightChange', 'onSizeChange', 'onInitialized',
                'offsetX', 'offsetY', 'timeScale', 'enablePerfLog', 'perfLogInterval', 'enableOffscreenWorker'
            ];
            
            for (let i = 0, len = optionKeys.length; i < len; i++) {
                if (options[optionKeys[i]]) {
                    this[optionKeys[i]] = options[optionKeys[i]];
                }
            }
        }

        this.isLittleEndian = this.detectLittleEndian();
        if (!this.isLittleEndian) {
            console.warn("ImageAtomizer: Packed draw path expects little-endian byte order.");
        }
        
        // DOM elements
        this.$container = document.getElementById(this.elementId);
        this.$canv = this.$container.querySelector("canvas.atomizer");

        this.useWorker = this.enableOffscreenWorker === true && this.supportsOffscreenWorker();
        
        // Canvas elements
        if (!this.useWorker) {
            this.$srcCanv = document.createElement("canvas");
            this.$srcCanv.style.display = "none";
            this.$container.appendChild(this.$srcCanv);
        }
        
        // Set dimensions if not specified
        if (this.width <= 0) {
            this.width = this.$container.clientWidth;
        }
        if (this.height <= 0) {
            this.height = this.$container.clientHeight;
        }
        
        // Mouse and interaction properties 
        this.monochromeColorArr = this.parseColor(this.monochromeColor);
        this.mx = -1;
        this.my = -1;
        // For touch/swipe devices
        this.touchX = null;
        this.touchY = null;
        
        // Canvas dimensions
        this.cw = this.getCanvasWidth();
        this.ch = this.getCanvasHeight();
        
        // Animation properties
        this.frame = 0;
        this.hasInitialized = false;
        this.lastTimestamp = null;
        this.baseFrameDuration = 1000 / 60;
        this.perfFrameCount = 0;
        this.perfAccumulatedMs = 0;
        this.perfAccumulatedDrawMs = 0;
        this.perfLastLog = null;
        
        // Particle buffers (struct-of-arrays)
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
        
        // Canvas contexts
        this.ctx = this.useWorker ? null : this.$canv.getContext("2d");
        this.srcCtx = this.useWorker ? null : this.$srcCanv.getContext("2d", { willReadFrequently: true });
        
        // Set canvas dimensions
        this.$canv.width = this.cw;
        this.$canv.height = this.ch;
        if (this.useWorker) {
            this.offscreenCanvas = this.$canv.transferControlToOffscreen();
            this.initWorker();
            this.initResizeObserver();
        }

        this.supportsSwipeEvents = function() {
            return window && 'ontouchstart' in window;
        }
        
        // Shuffle function for arrays
        this.shuffle = function() {
            let temp, randomIndex;
            for (let i = 0, len = this.length; i < len; i++) {
                randomIndex = Math.floor(Math.random() * len);
                temp = this[i];
                this[i] = this[randomIndex];
                this[randomIndex] = temp;
            }
        };
        Array.prototype.shuffle = this.shuffle;

        const getOffset = (element) => {
            let offsetLeft = 0;
            let offsetTop = 0;
            let targetElement = typeof element === "string" ? document.getElementById(element) : element;
            
            if (targetElement) {
                offsetLeft = targetElement.offsetLeft;
                offsetTop = targetElement.offsetTop;
                const body = document.getElementsByTagName("body")[0];
                
                while (targetElement.offsetParent && targetElement !== body) {
                    offsetLeft += targetElement.offsetParent.offsetLeft;
                    offsetTop += targetElement.offsetParent.offsetTop;
                    targetElement = targetElement.offsetParent;
                }
            }
            return { x: offsetLeft + this.offsetX, y: offsetTop + this.offsetY };
        };
        
        // Mouse event handlers
        this.$canv.onmouseout = () => {
            this.mx = -1;
            this.my = -1;
            if (this.useWorker) {
                this.postWorker({ type: "pointerOut" });
            }
        };
        
        if (this.supportsSwipeEvents()) {
            const trackTouchCoordinates = (x, y) => {
                const offset = getOffset(this.$container);
                this.mx = x - offset.x + window.scrollX;
                this.my = y - offset.y + window.scrollY;
                if (this.useWorker) {
                    this.postWorker({ type: "pointer", x: this.mx, y: this.my });
                }
            }
            this.$canv.ontouchstart = (event) => {
                trackTouchCoordinates(event.touches[0].clientX, event.touches[0].clientY);
            }
            this.$canv.ontouchmove = (event) => {
                trackTouchCoordinates(event.touches[0].clientX, event.touches[0].clientY);
            }
            this.$canv.ontouchend = (event) => {
                this.mx = -1;
                this.my = -1;
                if (this.useWorker) {
                    this.postWorker({ type: "pointerOut" });
                }
            }
        } else {
            this.$canv.onmousemove = (event) => {
                const offset = getOffset(this.$container);
                this.mx = event.clientX - offset.x + window.scrollX;
                this.my = event.clientY - offset.y + window.scrollY;
                if (this.useWorker) {
                    this.postWorker({ type: "pointer", x: this.mx, y: this.my });
                }
            };
        }
        
        this.loadImage = function(imageSource) {
            // Set the image source
            this.image = new Image();
            this.isImageLoaded = false;

            if (imageSource) {
                this.image.src = imageSource;
                
                this.image.onload = () => {
                    this.isImageLoaded = true;
                    if (this.useWorker) {
                        this.setImage(this.image);
                        this.play();
                    } else {
                        this.resize();
                        // Start animation
                        this.play();
                    }
                };
            } else {
                return console.error('ImageAtomizer: You must provide an image source as the first argument when instanciating a `new ImageAtomizer(imageSrc, options)`.');
            }

            this.image.onerror = () => {
                return console.error('ImageAtomizer: Failed to load the provided image source (%s). Please check the image exists.', imageSource);
            }
        }
        this.loadImage(imageSrc);   
    }

    packColor(color) {
        return ((color[3] & 0xff) << 24) | ((color[2] & 0xff) << 16) | ((color[1] & 0xff) << 8) | (color[0] & 0xff);
    }

    supportsOffscreenWorker() {
        return typeof OffscreenCanvas !== "undefined"
            && typeof Worker !== "undefined"
            && typeof HTMLCanvasElement !== "undefined"
            && typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function"
            && typeof createImageBitmap === "function";
    }

    getWorkerOptions() {
        return {
            particleGap: this.particleGap,
            particleSize: this.particleSize,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            monochrome: this.monochrome,
            monochromeColor: this.monochromeColor,
            mouseForce: this.mouseForce,
            restless: this.restless,
            timeScale: this.timeScale,
            enablePerfLog: this.enablePerfLog,
            perfLogInterval: this.perfLogInterval
        };
    }

    initWorker() {
        if (!this.useWorker || this.worker) {
            return;
        }
        this.worker = new Worker(new URL("./atomizer-worker.js", import.meta.url), { type: "module" });
        this.worker.onmessage = (event) => {
            const data = event.data;
            if (data && data.type === "initialized") {
                if (!this.hasInitialized && this.onInitialized) {
                    this.onInitialized();
                }
                this.hasInitialized = true;
            }
        };
    }

    initResizeObserver() {
        if (!this.useWorker || this.resizeObserver || typeof ResizeObserver === "undefined") {
            return;
        }
        this.resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;
            const newWidth = Math.round(entry.contentRect.width);
            const newHeight = Math.round(entry.contentRect.height);
            if (newWidth === this.cw && newHeight === this.ch) return;
            if (this.cw !== newWidth && typeof this.onWidthChange === "function") {
                this.onWidthChange(this, newWidth);
            }
            if (this.ch !== newHeight && typeof this.onHeightChange === "function") {
                this.onHeightChange(this, newHeight);
            }
            if ((this.cw !== newWidth || this.ch !== newHeight) && typeof this.onSizeChange === "function") {
                this.onSizeChange(this, newWidth, newHeight);
            }
            this.resize();
        });
        this.resizeObserver.observe(this.$container);
    }

    postWorker(message, transferList) {
        if (!this.worker) {
            return;
        }
        if (transferList && transferList.length) {
            this.worker.postMessage(message, transferList);
        } else {
            this.worker.postMessage(message);
        }
    }

    setImage(image) {
        this.image = image;
        this.isImageLoaded = true;
        if (!this.useWorker) {
            this.resize();
            return;
        }
        if (!this.worker) {
            this.initWorker();
        }
        createImageBitmap(image).then((bitmap) => {
            if (!this.worker) return;
            if (this.offscreenCanvas) {
                this.postWorker({
                    type: "init",
                    canvas: this.offscreenCanvas,
                    width: this.cw,
                    height: this.ch,
                    options: this.getWorkerOptions(),
                    imageBitmap: bitmap
                }, [this.offscreenCanvas, bitmap]);
                this.offscreenCanvas = null;
                if (this.isRunning) {
                    this.postWorker({ type: "play" });
                }
            } else {
                this.postWorker({ type: "setImage", imageBitmap: bitmap }, [bitmap]);
                this.postWorker({ type: "resize", width: this.cw, height: this.ch });
                this.postWorker({ type: "initParticles" });
                if (this.isRunning) {
                    this.postWorker({ type: "play" });
                }
            }
        });
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

    detectLittleEndian() {
        const buffer = new ArrayBuffer(4);
        const view32 = new Uint32Array(buffer);
        const view8 = new Uint8Array(buffer);
        view32[0] = 0x0a0b0c0d;
        return view8[0] === 0x0d;
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
    
    nextFrame(timestamp) {
        if (!this.isRunning) {
            return;
        }
        if (this.useWorker) {
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
        
        if (this.frame++ % 25 === 0 && (this.cw !== this.getCanvasWidth() || this.ch !== this.getCanvasHeight())) {
            const newWidth = this.getCanvasWidth();
            const newHeight = this.getCanvasHeight();
            
            if (this.cw !== newWidth && typeof this.onWidthChange === "function") {
                this.onWidthChange(this, newWidth);
            }
            if (this.ch !== newHeight && typeof this.onHeightChange === "function") {
                this.onHeightChange(this, newHeight);
            }
            if ( (this.cw !== newWidth || this.ch !== newHeight) && typeof this.onSizeChange === "function") {
                this.onSizeChange(this, newWidth, newHeight);
            }
            this.resize();
        }

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
                    "ImageAtomizer perf:",
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
    
    init() {
        if (this.useWorker) {
            this.postWorker({ type: "initParticles" });
            return;
        }
        if (this.isImageLoaded) {
            this.$srcCanv.width = this.image.width;
            this.$srcCanv.height = this.image.height;
            this.srcCtx.clearRect(0, 0, this.$srcCanv.width, this.$srcCanv.height);
            this.srcCtx.drawImage(this.image, 0, 0);
            
            const pixels = this.getPixelFromImageData(
                this.srcCtx.getImageData(0, 0, this.$srcCanv.width, this.$srcCanv.height),
                ~~(this.cw / 2 - this.$srcCanv.width / 2),
                ~~(this.ch / 2 - this.$srcCanv.height / 2),
            );
            
            pixels.shuffle();

            const targetCount = pixels.length;
            const prevActive = this.activeCount;
            if (targetCount > this.capacity) {
                this.ensureCapacity(targetCount);
            }
            if (targetCount > prevActive) {
                for (let i = prevActive; i < targetCount; i++) {
                    this.posX[i] = Math.random() * this.cw;
                    this.posY[i] = Math.random() * this.ch;
                    this.velX[i] = Math.random() * 10;
                    this.velY[i] = Math.random() * 10;
                    this.ttl[i] = -1;
                    this.colorIsFunc[i] = 0;
                    this.colorFuncs[i] = null;
                }
            }
            this.activeCount = Math.max(prevActive, targetCount);

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
        }
        if (!this.hasInitialized && this.onInitialized) {
            this.onInitialized();
        }
        this.hasInitialized = true;

    }
    
    getCanvasWidth() {
        return this.$container.clientWidth;
    }
    
    getCanvasHeight() {
        return this.$container.clientHeight;
    }
    
    resize() {
        this.cw = this.getCanvasWidth();
        this.ch = this.getCanvasHeight();
        if (this.useWorker) {
            this.postWorker({ type: "resize", width: this.cw, height: this.ch });
        } else {
            this.$canv.width = this.cw;
            this.$canv.height = this.ch;
            this.imageData = null;
            this.imageDataWidth = 0;
            this.imageDataHeight = 0;
            this.imageData32 = null;
            this.init();
        }
    }
    
    setColor(color) {
        this.monochromeColorArr = this.parseColor(color);
        if (this.useWorker) {
            this.postWorker({ type: "setColor", color });
        }
    }

    play() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        if (this.useWorker) {
            if (this.worker && !this.offscreenCanvas) {
                this.postWorker({ type: "play" });
            }
            return;
        }
        this.lastTimestamp = null; // avoid a large delta after a pause
        this.rafId = this.requestAnimationFrame(this.nextFrame);
    }

    pause() {
        if (!this.isRunning) {
            return;
        }
        this.isRunning = false;
        if (this.useWorker) {
            this.postWorker({ type: "pause" });
        } else {
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
            this.lastTimestamp = null;
        }
    }

    destroy() {
        if (this.useWorker) {
            this.postWorker({ type: "destroy" });
            if (this.worker) {
                this.worker.terminate();
                this.worker = null;
            }
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
    
    requestAnimationFrame(callback) {
        const requestAnimFrame = window.requestAnimationFrame || 
                              window.webkitRequestAnimationFrame || 
                              window.mozRequestAnimationFrame || 
                              window.oRequestAnimationFrame || 
                              window.msRequestAnimationFrame || 
                              function(callback) {
                                  return window.setTimeout(callback, 1000 / 60);
                              };
        return requestAnimFrame(callback);
    }
}

export { ImageAtomizer };
