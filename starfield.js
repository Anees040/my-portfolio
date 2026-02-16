class Starfield {
    constructor({
        canvasId = "starfield",
        starsCount = 300,
        starsColor = "#ffffff",
        starsRotationSpeed = 3, // degrees per second
        nebulasIntensity = 10,
        bgColor = "rgb(8,8,8)",
        originOffsetX = 0,
        originOffsetY = 0,
        metaData = {},
    } = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Starfield: canvas with id "${canvasId}" not found.`);
        }
        this.parentContainer = this.canvas.parentElement;
        this.ctx = this.canvas.getContext("2d");
        this.colorCanvas = document.createElement("canvas");
        this.colorCtx = this.colorCanvas.getContext("2d", { willReadFrequently: true });
        this.starsCount = starsCount;
        this.starsColor = this.parseColor(starsColor);
        this.starsRotationSpeed = starsRotationSpeed;
        this.nebulasIntensity = nebulasIntensity;
        this.bgColor = bgColor;
        this.originOffsetX = originOffsetX;
        this.originOffsetY = originOffsetY;
        const {deviceType, isMobileTouchDevice, startYMax, startYMin} = metaData;
        this.deviceType = deviceType;
        this.isMobileTouchDevice = isMobileTouchDevice;
        this.startYMax = startYMax;
        this.startYMin = startYMin;

        this.nebulaCanvas = document.createElement("canvas");
        this.nebulaCtx = this.nebulaCanvas.getContext("2d");
        this.randomSeed = 32173;
        this.nebulaColors = ["rgb(6,2,122)", "rgba(6, 76, 20, 1)", "#57046e"].map((c) => this.parseColor(c));
        this.nebulaLayers = this.buildNebulaLayers();

        this.stars = [];
        this.starBuffer = document.createElement("canvas");
        this.starBufferCtx = this.starBuffer.getContext("2d");
        this.isRunning = false;
        this.rafId = null;
        this.lastTimestamp = null;
        this.starRotation = 0;
        this.bufferSize = 0;
        this.bufferOrigin = 0;
        this.cometParticles = [];
        this.cometParticlePool = [];
        this.cometSpawnAccumulator = 0;
        this.comet = null;
        this.nextCometTime = null;
        this.cometMaxParticles = 500;
        this.cometArcConfig = {
            minWidth: 400,
            maxWidth: 2080,
            minArc: 0.10,
            maxArc: 0.25
        };
        this.cometParams = {
            headSpeed: 520,
            arcHeight: 0.25,
            emissionRate: 160,
            tailSpread: 0.6,
            particleLifeMin: 0.20,
            particleLifeMax: 0.75,
            particleSpeedMin: 30,
            particleSpeedMax: 110,
            particleRadiusMin: 0.7,
            particleRadiusMax: 1.8,
            headRadius: 2,
            headGlow: 8,
            fadeOutStart: 0.4
        };
        this.cometHeadCanvas = document.createElement("canvas");
        this.cometHeadCtx = this.cometHeadCanvas.getContext("2d");
        this.cometHeadSize = 0;
        this.buildCometHeadCache();

        this.resize = this.resize.bind(this);
        this.loop = this.loop.bind(this);

        this.resize();
        this.initStars();
        this.renderNebula();
        this.scheduleNextComet(0);
        this.play();
    }

    regenerateNebula(seed) {
        if (typeof seed === "number" && Number.isFinite(seed)) {
            this.randomSeed = seed >>> 0;
        } else {
            this.randomSeed = Math.floor(Math.random() * 4294967296) >>> 0;
        }
        this.nebulaLayers = this.buildNebulaLayers();
        this.renderNebula();
    }

    parseColor(color) {
        if (!this.colorCtx) {
            this.colorCtx = this.colorCanvas.getContext("2d", { willReadFrequently: true });
        }
        const ctx = this.colorCtx;
        if (!ctx) {
            throw new Error("Starfield: unable to create 2d context for color parsing.");
        }
        ctx.fillStyle = color;
        const computed = ctx.fillStyle;
        ctx.fillStyle = computed;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return [r, g, b];
    }

    buildCometHeadCache() {
        const ctx = this.cometHeadCtx;
        if (!ctx) return;
        const params = this.cometParams;
        const size = Math.ceil(params.headGlow * 2.4);
        this.cometHeadSize = size;
        this.cometHeadCanvas.width = size;
        this.cometHeadCanvas.height = size;
        ctx.clearRect(0, 0, size, size);
        const center = size / 2;
        const gradient = ctx.createRadialGradient(center, center, 0, center, center, params.headGlow);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.4, "rgba(200,230,255,0.7)");
        gradient.addColorStop(1, "rgba(50,120,255,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(center, center, params.headGlow, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.beginPath();
        ctx.arc(center, center, params.headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    }

    nextRandom() {
        // simple LCG for deterministic layering
        this.randomSeed = (this.randomSeed * 1664525 + 1013904223) % 4294967296;
        return this.randomSeed / 4294967296;
    }

    buildNebulaLayers() {
        const layers = [];
        const layersPerColor = 2;
        const totalLayers = this.nebulaColors.length * layersPerColor;
        const quadrants = [
            // Disbursing layers into quadrants to ensure better coverage
            { x: [0, 0.5], y: [0, 0.5] }, // top-left
            { x: [0.5, 1], y: [0, 0.5] }, // top-right
            { x: [0, 0.5], y: [0.5, 1] },  // bottom-left
            { x: [0.5, 1], y: [0.5, 1] }, // bottom-right
        ];
        const exclusionRadius = 0.22; // avoid center so atomizer overlay doesn't cover layers

        for (let idx = 0; idx < totalLayers; idx++) {
            const colorIndex = Math.floor(idx / layersPerColor);
            const quadrant = quadrants[idx % quadrants.length];

            let cxNorm = 0.25;
            let cyNorm = 0.25;
            let attempts = 0;
            // inset each quadrant slightly to prevent clipping at edges
            const xMin = quadrant.x[0] + 0.05;
            const xMax = quadrant.x[1] - 0.05;
            const yMin = quadrant.y[0] + 0.05;
            const yMax = quadrant.y[1] - 0.05;
            do {
                cxNorm = xMin + this.nextRandom() * (xMax - xMin);
                cyNorm = yMin + this.nextRandom() * (yMax - yMin);
                attempts++;
            } while (attempts < 8 && Math.hypot(cxNorm - 0.5, cyNorm - 0.5) < exclusionRadius);

            const radiusFactor = 0.30 + this.nextRandom() * 0.10;
            layers.push({
                color: this.nebulaColors[colorIndex],
                cxNorm,
                cyNorm,
                radiusFactor
            });
        }
        return layers;
    }

    resize({deviceType, isMobileTouchDevice} = {}) {
        this.canvas.width = document.documentElement.clientWidth;
        this.canvas.height = this.parentContainer.clientHeight;
        this.originX = this.canvas.width / 2 + this.originOffsetX;
        this.originY = this.canvas.height / 2 + this.originOffsetY;
        this.bufferSize = Math.max(this.canvas.width, this.canvas.height) * Math.SQRT2;
        this.bufferOrigin = this.bufferSize / 2;
        this.starBuffer.width = this.bufferSize;
        this.starBuffer.height = this.bufferSize;
        this.starRotation = 0;
        this.updateCometArcHeight();
        this.renderNebula();
        this.initStars();
        this.scheduleNextComet(0);
    }

    initStars() {
        const maxRadius = this.bufferSize * 0.5;
        this.stars = new Array(this.starsCount).fill(0).map(() => {
            // sqrt-distribution to spread stars more evenly across the area
            const distance = Math.sqrt(Math.random()) * maxRadius;
            const angle = Math.random() * Math.PI * 2;
            const size = Math.random() * 2 + 0.1;
            return { distance, angle, size };
        });
        this.renderStarBuffer();
        this.recycleCometParticles();
        this.comet = null;
    }

    renderNebula() {
        const { nebulaCtx: ctx, nebulaCanvas: canvas, nebulasIntensity, bgColor } = this;
        if (!ctx) return;
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const alphaScale = Math.min(.25, nebulasIntensity * 0.05);
        ctx.globalCompositeOperation = "lighter";
        this.nebulaLayers.forEach((layer) => {
            const cx = canvas.width * layer.cxNorm;
            const cy = canvas.height * layer.cyNorm;
            const radius = Math.max(canvas.width, canvas.height) * layer.radiusFactor;
            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            gradient.addColorStop(0, this.withAlpha(layer.color, alphaScale));
            gradient.addColorStop(0.32, this.withAlpha(layer.color, alphaScale * 0.85));
            gradient.addColorStop(0.6, this.withAlpha(layer.color, alphaScale * 0.4));
            gradient.addColorStop(1, this.withAlpha(layer.color, 0));
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
        ctx.globalCompositeOperation = "source-over";
    }

    renderStarBuffer() {
        const ctx = this.starBufferCtx;
        if (!ctx) return;
        ctx.clearRect(0, 0, this.starBuffer.width, this.starBuffer.height);
        ctx.fillStyle = `rgb(${this.starsColor[0]}, ${this.starsColor[1]}, ${this.starsColor[2]})`;
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const x = this.bufferOrigin + Math.cos(star.angle) * star.distance;
            const y = this.bufferOrigin + Math.sin(star.angle) * star.distance;
            ctx.beginPath();
            ctx.arc(x, y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    withAlpha(colorArr, alpha) {
        return `rgba(${colorArr[0]}, ${colorArr[1]}, ${colorArr[2]}, ${alpha})`;
    }

    drawStars(deltaSeconds) {
        const { ctx, originX, originY, starsRotationSpeed } = this;
        const rotationRadians = (starsRotationSpeed * Math.PI / 180) * deltaSeconds;
        this.starRotation += rotationRadians;

        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(this.starRotation);
        ctx.translate(-this.bufferOrigin, -this.bufferOrigin);
        ctx.drawImage(this.starBuffer, 0, 0);
        ctx.restore();
    }

    scheduleNextComet(offsetMs = 0) {
        const now = performance.now();
        const delay = 2000 + Math.random() * 6000; // 2s - 8s
        this.nextCometTime = now + offsetMs + delay;
    }

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    }

    updateCometArcHeight() {
        const { minWidth, maxWidth, minArc, maxArc } = this.cometArcConfig;
        const width = this.canvas.width;
        const t = Math.min(1, Math.max(0, (width - minWidth) / (maxWidth - minWidth)));
        this.cometParams.arcHeight = minArc + (maxArc - minArc) * t;
    }

    getCometStartY() {
        // startYMin & startYMax are custom metaData vars that may or may not be passed into this Starfield object.
        if (!this.startYMax || !this.startYMin) {
            return this.canvas.height * this.randomRange(0.28, 0.65);
        }
        if (this.startYMin >= this.startYMax) {
            const max = this.canvas.height * (this.startYMax + this.cometParams.arcHeight);
            const min = this.canvas.height * ((this.startYMax + this.cometParams.arcHeight) - (65 / this.canvas.height));
            return this.randomRange(min, max);
        }
        const max = this.canvas.height * (this.startYMax + this.cometParams.arcHeight);
        const min = this.canvas.height * (this.startYMin + this.cometParams.arcHeight);
        return this.randomRange(min, max);   
    }

    createComet() {
        const startY = this.getCometStartY();
        
        return {
            progress: 0,
            duration: Math.max(0.2, (this.canvas.width + 220) / this.cometParams.headSpeed),
            baseY: startY,
            arcDir: -1,
            lastPos: { x: -120, y: startY }
        };
    }

    spawnComet() {
        this.recycleCometParticles();
        this.cometSpawnAccumulator = 0;
        this.comet = this.createComet();
        this.scheduleNextComet(0);
    }

    recycleCometParticles() {
        for (let i = 0; i < this.cometParticles.length; i++) {
            this.cometParticlePool.push(this.cometParticles[i]);
        }
        this.cometParticles.length = 0;
    }

    spawnCometParticles(head, dt) {
        const params = this.cometParams;
        this.cometSpawnAccumulator += params.emissionRate * dt;
        const count = Math.floor(this.cometSpawnAccumulator);
        this.cometSpawnAccumulator -= count;
        const available = Math.max(0, this.cometMaxParticles - this.cometParticles.length);
        const emitCount = Math.min(count, available);

        const baseSpeedX = (head.x - head.prevX) / dt;
        const baseSpeedY = (head.y - head.prevY) / dt;

        for (let i = 0; i < emitCount; i++) {
            const angle = Math.PI + this.randomRange(-params.tailSpread, params.tailSpread) + baseSpeedY * 0.0005;
            const speed = this.randomRange(params.particleSpeedMin, params.particleSpeedMax);
            const p = this.cometParticlePool.pop() || {};
            p.x = head.x;
            p.y = head.y;
            p.vx = Math.cos(angle) * speed + baseSpeedX * 0.12;
            p.vy = Math.sin(angle) * speed + baseSpeedY * 0.12;
            p.life = this.randomRange(params.particleLifeMin, params.particleLifeMax);
            p.ttl = 0;
            p.radius = this.randomRange(params.particleRadiusMin, params.particleRadiusMax);
            this.cometParticles.push(p);
        }
    }

    updateCometParticles(dt) {
        let writeIndex = 0;
        for (let i = 0; i < this.cometParticles.length; i++) {
            const p = this.cometParticles[i];
            p.ttl += dt;
            if (p.ttl > p.life) {
                this.cometParticlePool.push(p);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.995;
            p.vy *= 0.995;
            this.cometParticles[writeIndex++] = p;
        }
        this.cometParticles.length = writeIndex;
    }

    drawCometParticles() {
        const ctx = this.ctx;
        const params = this.cometParams;
        ctx.globalCompositeOperation = "lighter";
        for (const p of this.cometParticles) {
            const alpha = 1 - p.ttl / p.life;
            const tailTint = 160 + Math.floor(80 * alpha);
            ctx.fillStyle = `rgba(${tailTint}, 220, 255, ${alpha * 0.55})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = "source-over";
    }

    drawCometHead(head, alpha) {
        const ctx = this.ctx;
        if (!this.cometHeadCtx || this.cometHeadSize === 0) {
            this.buildCometHeadCache();
        }
        const half = this.cometHeadSize / 2;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = alpha;
        ctx.drawImage(this.cometHeadCanvas, head.x - half, head.y - half);
        ctx.restore();
    }

    updateComet(deltaSeconds, timestamp) {
        if (this.nextCometTime !== null && timestamp >= this.nextCometTime && !this.comet) {
            this.spawnComet();
        }

        const params = this.cometParams;
        if (this.comet) {
            const c = this.comet;
            c.progress += deltaSeconds / c.duration;
            const t = Math.min(c.progress, 1);
            const startX = -120;
            const endX = this.canvas.width + 60;
            const x = startX + (endX - startX) * t;
            const arc = Math.sin(t * Math.PI) * params.arcHeight * this.canvas.height * c.arcDir;
            const y = c.baseY + arc;
            const head = { x, y, prevX: c.lastPos.x, prevY: c.lastPos.y };
            c.lastPos = { x, y };

            const fadeStart = params.fadeOutStart;
            const headAlpha = t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / Math.max(0.001, 1 - fadeStart));

            this.spawnCometParticles(head, deltaSeconds);
            this.drawCometHead(head, headAlpha);

            if (t >= 1) {
                this.comet = null;
                this.scheduleNextComet(0);
            }
        }

        this.updateCometParticles(deltaSeconds);
        this.drawCometParticles();
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        if (this.lastTimestamp === null) {
            this.lastTimestamp = timestamp;
        }
        const deltaMs = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        const deltaSeconds = deltaMs / 1000;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.nebulaCanvas) {
            this.ctx.drawImage(this.nebulaCanvas, 0, 0);
        }
        this.drawStars(deltaSeconds);
        this.updateComet(deltaSeconds, timestamp);

        this.rafId = requestAnimationFrame(this.loop);
    }

    play() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTimestamp = null;
        this.rafId = requestAnimationFrame(this.loop);
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy() {
        this.pause();
        window.removeEventListener("resize", this.resize);
    }
}

export { Starfield };
