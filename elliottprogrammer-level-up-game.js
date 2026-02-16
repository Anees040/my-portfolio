import { getDeviceType } from './main.js';
// Floating Text Effect
class FloatingText {
    constructor(x, y, text, scale, fontSize = 32) {
        this.x = x;
        this.y = y;
        this.startY = y;
        this.text = text;
        this.scale = scale;
        this.fontSize = fontSize * this.scale;
        
        // Animation properties
        this.opacity = 1;
        this.totalDistance = 350 * scale;
        this.speed = 0.8 * scale;
        this.opacityDecrease = 0.006
        ;
        this.isComplete = false;
    }

    update() {
        // Move upward
        this.y -= this.speed;
        
        // Decrease opacity
        this.opacity -= this.opacityDecrease;
        
        // Check if animation is complete
        const distanceTraveled = this.startY - this.y;
        if (distanceTraveled >= this.totalDistance || this.opacity <= 0) {
            this.isComplete = true;
        }
    }

    draw(ctx) {
        if (this.isComplete) return;
        
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    get completed() {
        return this.isComplete;
    }
}

// Game Asset - Rotating Gradient Circle
class GameAsset {
    constructor(x, y, text, position, canvasWidth, maxCanvasWidth) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.position = position;
        
        // Base dimensions at max canvas size
        this.baseSize = 90;
        this.baseStrokeWidth = 2;
        
        this.scale = canvasWidth / maxCanvasWidth;
        this.size = this.baseSize * this.scale;
        this.strokeWidth = this.baseStrokeWidth * this.scale;
        
        // Rotation state
        this.rotation = 0;
        this.rotationSpeed = 0.02; // radians per frame
        
        // Hover animation state
        this.hoverTime = 0;
        this.hoverSpeed = 0.015; // controls hover frequency
        this.hoverAmount = 5; // how much to move up/down in pixels at max scale
        this.hoverAmplitude = this.hoverAmount * this.scale; // how much to move up/down
        this.baseY = y; // store base Y position
        

        // Gradient colors
        this.gradientStartColor = '#ffffff'; // #4befdd
        this.gradientEndColor = '#17786f'; // #1b928c
    }

    update() {
        // Update rotation for spinning effect
        this.rotation += this.rotationSpeed;
        if (this.rotation >= Math.PI * 2) {
            this.rotation -= Math.PI * 2;
        }
        
        // Update hover animation
        this.hoverTime += this.hoverSpeed;
        const hoverOffset = Math.sin(this.hoverTime) * this.hoverAmplitude;
        this.y = this.baseY + hoverOffset;
    }

    setScale(newScale) {
        this.scale = newScale;
        this.size = this.baseSize * this.scale;
        this.strokeWidth = this.baseStrokeWidth * this.scale;
        this.hoverAmplitude = this.hoverAmount * this.scale; // rescale hover amplitude
    }

    checkCollision(spriteX, spriteY, spriteWidth, spriteHeight) {
        // Check if sprite is close to the center of the asset
        // Using a collision radius around the center
        const collisionRadius = this.size / 2;
        const spriteCenterX = spriteX + spriteWidth / 2;
        const spriteCenterY = spriteY + spriteHeight / 2 + (50 * this.scale);
        
        // Calculate distance between sprite center and asset center
        const dx = spriteCenterX - this.x;
        const dy = spriteCenterY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Collision if sprite center is within the asset's radius
        return distance < collisionRadius;
    }

    draw(ctx) {
        // Save context for transformations
        ctx.save();
        
        // Move to asset position and apply rotation
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Calculate gradient angle based on rotation
        const gradientAngle = this.rotation;
        const cos = Math.cos(gradientAngle);
        const sin = Math.sin(gradientAngle);
        const radius = this.size / 2;
        
        // Create rotating gradient for stroke
        const gradient = ctx.createLinearGradient(
            -radius * cos, -radius * sin,
            radius * cos, radius * sin
        );
        gradient.addColorStop(0, this.gradientStartColor);
        gradient.addColorStop(0.2, this.gradientStartColor);
        gradient.addColorStop(1, this.gradientEndColor);
        
        // Draw multiple circles with gradient glow effect
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            
            // Use the same rotating gradient for all layers
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.strokeWidth;
            
            // Apply blur for glow effect - increases with outer layers
            ctx.shadowBlur = i * 5;
            // Alternating shadow colors for colored glow effect
            ctx.shadowColor = i % 2 === 0 ? this.gradientStartColor : this.gradientEndColor;
            
            ctx.stroke();
        }
        
        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        
        // Restore context for text drawing (no rotation)
        ctx.restore();
        
        // Draw text centered (not rotating)
        ctx.save();
        ctx.fillStyle = '#ffffff';
        const lineHeight = 16 * this.scale;
        const fontSize = 14 * this.scale;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const lines = this.text.split('\n');
        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], this.x, this.y + (lineHeight * i) - (fontSize * lines.length / 2) + fontSize/2);
        }
        ctx.restore();
    }
}

// Sprite Animation System
class SpriteAnimation {

    constructor(image, frames, frameRate = 24, loop = true) {
        this.image = image;
        this.frames = frames;
        this.frameRate = frameRate;
        this.frameDuration = 1000 / frameRate; // milliseconds per frame
        this.currentFrame = 0;
        this.lastFrameTime = 0;
        this.isPlaying = true;
        this.loop = loop;
        this.isComplete = false;
    }

    update(currentTime) {
        if (!this.isPlaying) return;

        if (currentTime - this.lastFrameTime >= this.frameDuration) {
            this.currentFrame++;
            
            // Check if animation is complete
            if (this.currentFrame >= this.frames.length) {
                if (this.loop) {
                    this.currentFrame = 0; // Loop back to start
                } else {
                    this.currentFrame = this.frames.length - 1; // Stay on last frame
                    this.isComplete = true;
                    this.isPlaying = false;
                }
            }
            
            this.lastFrameTime = currentTime;
        }
    }

    draw(ctx, x, y) {
        const frame = this.frames[this.currentFrame];
        ctx.drawImage(
            this.image,
            frame.frame.x,
            frame.frame.y,
            frame.frame.w,
            frame.frame.h,
            x,
            y,
            frame.frame.w,
            frame.frame.h
        );
    }

    play() {
        this.isPlaying = true;
        this.isComplete = false;
    }

    pause() {
        this.isPlaying = false;
    }

    reset() {
        this.currentFrame = 0;
        this.lastFrameTime = 0;
        this.isComplete = false;
        this.isPlaying = true;
    }

    isFinished() {
        return this.isComplete;
    }
}

// Main Game Class
class LevelUpGame {
    constructor({onGameComplete, onLevelsComplete, onReset}) {
        if (onLevelsComplete && typeof onLevelsComplete === 'function' ) {
            this.onLevelsComplete = onLevelsComplete;
        }
        if (onGameComplete && typeof onGameComplete === 'function' ) {
            this.onGameComplete = onGameComplete;
        }
        if (onReset && typeof onReset === 'function' ) {
            this.onReset = onReset;
        }
        this.deviceType = getDeviceType();
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.aspectRatio = 3 / 2;
        this.canvasParent = document.querySelector('.game-container');
        this.canvasWidth = this.canvasParent.clientWidth;
        this.canvasHeight = this.canvasWidth / this.aspectRatio;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.animationFrameId = null;
        this.isRunning = false;
        
        // Sprite scaling properties
        this.maxCanvasWidth = 1536;
        this.maxCanvasHeight = 1024;
        this.spriteOriginalWidth = 330;
        this.spriteOriginalHeight = 531;
        this.spriteScale = this.canvasWidth / this.maxCanvasWidth;
        
        // Base positions at max canvas size (reference for scaling)
        this.baseSpriteX = 1200;
        this.baseSpriteY = 445;
        this.baseJumpMoveX = -210;
        this.baseJumpMoveY = -100;
        this.baseAssetX = 1150;
        this.baseAssetY = 680;
        
        // Current actual positions (scaled)
        this.currentSpriteX = this.baseSpriteX * this.spriteScale;
        this.currentSpriteY = this.baseSpriteY * this.spriteScale;

        this.backgroundImage = null;
        this.spriteSheet = null;
        this.spriteData = null;
        this.spriteAnimation = null;
        this.jumpSpriteSheet = null;
        this.jumpSpriteData = null;
        this.jumpAnimation = null;
        this.celebrateSpriteSheet = null;
        this.celebrateSpriteData = null;
        this.celebrateAnimation = null;
        this.hasCelebrated = false;
        this.spriteX = this.currentSpriteX;
        this.spriteY = this.currentSpriteY;
        this.baseX = this.currentSpriteX; // Store current position for jump calculations
        this.baseY = this.currentSpriteY; // Store current position for jump calculations
        this.assets = []; // Array to store game assets
        this.floatingTexts = []; // Array to store floating text effects
        this.orbs = [
            { name: 'System\nDesign', position: 0 },
            { name: 'Performance', position: 1 },
            { name: 'AI Tools', position: 2 },
            { name: 'Security\n& Auth', position: 3 },
            { name: 'Project\nManagement', position: 4 },
        ];
        this.collectSound = null; // Sound for collecting assets
        this.cheerSound = null;
        this.audioLoaded = false;
        this.isLoaded = false;
        this.startButton = null;
        this.stopButton = null;
        this.currentAnimation = 'idle'; // 'idle' or 'jump' or 'celebrate'
        this.jumpMovementStartFrame = 22; // Start movement at frame 22
        this.jumpMovementEndFrame = 34; // End movement at frame 40
        this.jumpTotalFrames = 56; // Total jump frames
        this.jumpMovementFrames = this.jumpMovementEndFrame - this.jumpMovementStartFrame; // 12 frames
        this.jumpTotalMoveX = this.baseJumpMoveX * this.spriteScale; // Scaled X movement
        this.jumpTotalMoveY = this.baseJumpMoveY * this.spriteScale; // Scaled Y movement
        this.jumpMovePerFrameX = this.jumpTotalMoveX / this.jumpMovementFrames; // Scaled per frame X
        this.jumpMovePerFrameY = this.jumpTotalMoveY / this.jumpMovementFrames; // Scaled per frame Y
        this.jumpCount = 0;
        this.setupEventListeners();
    }

    createOrbAssets() {
        const scaledAssetX = this.baseAssetX * this.spriteScale;
        const scaledAssetY = this.baseAssetY * this.spriteScale;
        const scaledJumpMoveX = this.baseJumpMoveX * this.spriteScale;
        const scaledJumpMoveY = this.baseJumpMoveY * this.spriteScale;
        for (let i = 0; i < this.orbs.length; i++) {
            const orbName = this.orbs[i].name;
            const asset = new GameAsset(scaledAssetX + (scaledJumpMoveX * i), scaledAssetY + (scaledJumpMoveY * i), orbName, this.orbs[i].position, this.canvasWidth, this.maxCanvasWidth);
            this.assets.push(asset);
        }
    }

    async loadAssets() {
        try {
            // Load background image
            this.backgroundImage = await this.loadImage('images/elliottprogrammer-level-up-scene.webp');
            
            // Load idle sprite sheet
            this.spriteSheet = await this.loadImage('idle-sprite/spritesheet.webp');
            
            // Load idle sprite data
            const idleResponse = await fetch('idle-sprite/spritesheet.json');
            this.spriteData = await idleResponse.json();
            
            // Load jump sprite sheet
            this.jumpSpriteSheet = await this.loadImage('jump-sprite/spritesheet.webp');
            
            // Load jump sprite data
            const jumpResponse = await fetch('jump-sprite/spritesheet.json');
            this.jumpSpriteData = await jumpResponse.json();

            // Load celebrate sprite sheet
            this.celebrateSpriteSheet = await this.loadImage('celebration-sprite/spritesheet.webp');

            // Load celebrate sprite data
            const celebrateResponse = await fetch('celebration-sprite/spritesheet.json');
            this.celebrateSpriteData = await celebrateResponse.json();
            
            // Create sprite animations
            this.spriteAnimation = new SpriteAnimation(this.spriteSheet, this.spriteData.frames, 30, true); // idle loops
            this.jumpAnimation = new SpriteAnimation(this.jumpSpriteSheet, this.jumpSpriteData.frames, 30, false); // jump plays once
            this.celebrateAnimation = new SpriteAnimation(this.celebrateSpriteSheet, this.celebrateSpriteData.frames, 30, false); // celebrate plays once
            
            // Create game assets
            // Base positions at max canvas size (reference for scaling)
            this.createOrbAssets();
            
            // Load sound
            // Note: On mobile, sound only loads after user interaction.
            this.collectSound = document.getElementById('collect-sound');
            this.cheerSound = document.getElementById('cheer-sound');
            this.cheerSound.addEventListener('ended', function() {
                console.log('sound complete!');
            });

            this.isLoaded = true;
            this.render();
            this.updateControlButtons();
            console.log('Assets loaded successfully');
            console.log(`Loaded ${this.spriteData.frames.length} idle sprite frames`);
            console.log(`Loaded ${this.jumpSpriteData.frames.length} jump sprite frames`);
            console.log(`Created ${this.assets.length} game assets`);   
        } catch (error) {
            console.error('Error loading assets:', error);
        }
    }

    loadSound(src) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.onloadeddata = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load sound: ${src}`));
            audio.src = src;
        });
    }

    playSound(sound) {
        if (sound) {
            sound.currentTime = 0;
            sound.volume = 0.2;
            sound.play();
        }
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
        });
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        const platformButtons = document.querySelectorAll('button.platform-jump');
        platformButtons.forEach( button => {
            button.addEventListener('click', (e) => {
                const platformNum = parseInt(e.target?.dataset?.num, 10);
                if (this.isLoaded && platformNum === this.jumpCount + 1) {
                        this.triggerJump();
                }
            })
        });
        
        // Reset button event listener
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetCharacter());
        }

        this.startButton = document.getElementById('startButton');
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.play();
            });
            this.startButton.disabled = true;
        }

        this.stopButton = document.getElementById('stopButton');
        if (this.stopButton) {
            this.stopButton.addEventListener('click', () => this.pause());
            this.stopButton.disabled = true;
        }
    }

    triggerJump() {
        if (!this.isRunning  || !this.assets.length) return;
        // Only allow jump if we're currently in idle animation
        if (this.currentAnimation === 'idle') {
            this.currentAnimation = 'jump';
            this.jumpAnimation.reset();
            // Start jump from current position
            this.baseX = this.spriteX;
            this.baseY = this.spriteY;
            console.log('Jump animation triggered from position:', this.spriteX, this.spriteY);
        }
    }

    resetCharacter() {
        // Call user defined callback (if it's set)
        this.onReset && this.onReset();
        // Reset character to original starting position
        this.currentSpriteX = this.baseSpriteX * this.spriteScale;
        this.currentSpriteY = this.baseSpriteY * this.spriteScale;
        this.spriteX = this.currentSpriteX;
        this.spriteY = this.currentSpriteY;
        this.baseX = this.spriteX;
        this.baseY = this.spriteY;
        this.jumpCount = 0;
        this.hasCelebrated = false;
        
        // Reset animations
        this.currentAnimation = 'idle';
        this.spriteAnimation.reset();
        this.jumpAnimation.reset();
        this.celebrateAnimation.reset();
        
        // Recreate all assets
        this.assets = [];
        this.createOrbAssets();
        
        this.render();
        
        console.log('Character and assets reset to original positions');
    }

    updateControlButtons() {
        if (this.startButton) {
            this.startButton.disabled = !this.isLoaded || this.isRunning;
        }
        if (this.stopButton) {
            this.stopButton.disabled = !this.isRunning;
        }
    }

    play() {
        if (!this.isLoaded || this.isRunning) return;
        
        this.isRunning = true;
        this.updateControlButtons();
        console.log('Gameplay is active.');
        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    pause() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        this.updateControlButtons();
        console.log('Gameplay paused.');
    }

    update(currentTime) {
        if (!this.isLoaded) return;
        
        // Update sprite animations
        if (this.currentAnimation === 'idle') {
            this.spriteAnimation.update(currentTime);
        } else if (this.currentAnimation === 'jump') {
            this.jumpAnimation.update(currentTime);
            
            // Handle movement during jump animation
            if (this.jumpAnimation.currentFrame >= this.jumpMovementStartFrame && this.jumpAnimation.currentFrame <= this.jumpMovementEndFrame) {
                // Calculate how many frames we've been moving
                const movementFrames = this.jumpAnimation.currentFrame - this.jumpMovementStartFrame;
                
                // Apply movement based on current frame
                this.spriteX = this.baseX + (this.jumpMovePerFrameX * movementFrames);
                this.spriteY = this.baseY + (this.jumpMovePerFrameY * movementFrames);
            } else if (this.jumpAnimation.currentFrame > this.jumpMovementEndFrame) {
                // After movement is complete, stay at the final position
                this.spriteX = this.baseX + this.jumpTotalMoveX;
                this.spriteY = this.baseY + this.jumpTotalMoveY;
            }
            
            // Check if jump animation is complete
            if (this.jumpAnimation.isFinished()) {
                if (! this.assets.length && ! this.hasCelebrated) {
                    // All levels completed. Time to celebrate!
                    this.currentAnimation = 'celebrate';
                    this.playSound(this.cheerSound);
                    // Call user defined callback, if it exists.
                    this.onLevelsComplete && this.onLevelsComplete();
                } else {
                    this.currentAnimation = 'idle';
                    this.spriteAnimation.reset();
                    // Update current position to the new final position
                    this.currentSpriteX = this.spriteX;
                    this.currentSpriteY = this.spriteY;
                    this.jumpCount += 1;
                    console.log('Jump animation complete, staying at new position:', this.spriteX, this.spriteY);
                }
            }
        } else if (this.currentAnimation === 'celebrate') {
            this.celebrateAnimation.update(currentTime);
            if (this.celebrateAnimation.isFinished()) {
                this.hasCelebrated = true;
                this.currentAnimation = 'idle';
                this.spriteAnimation.reset();
                console.log('Celebrate animation complete, going back to idle', this.spriteX, this.spriteY);
                // Call user defined callback, if it exists.
                this.onGameComplete && this.onGameComplete();
            }
        }
        
        // Update game assets (rotation)
        this.assets.forEach(asset => asset.update());
        
        // Check for collisions between sprite and assets
        const spriteWidth = this.spriteOriginalWidth * this.spriteScale;
        const spriteHeight = this.spriteOriginalHeight * this.spriteScale;
        
        for (let i = this.assets.length - 1; i >= 0; i--) {
            const asset = this.assets[i];
            if (asset.checkCollision(this.spriteX, this.spriteY, spriteWidth, spriteHeight)) {
                // Collision detected - remove asset and play sound
                this.assets.splice(i, 1);
                this.playSound(this.collectSound);
                
                // Create floating text at character position
                const textX = this.spriteX + (120 * this.spriteScale); // + spriteWidth / 2;
                const textY = this.spriteY + 50;
                const floatingText = new FloatingText(textX, textY, '+1 skill', this.spriteScale, 32);
                this.floatingTexts.push(floatingText);
                
                console.log('Asset collected!');
            }
        }
        
        // Update floating texts
        this.floatingTexts.forEach(text => text.update());
        
        // Remove completed floating texts
        this.floatingTexts = this.floatingTexts.filter(text => !text.isComplete);
    }

    render() {
        if (!this.isLoaded) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
        }

        // Draw current animation with scaling
        if (this.currentAnimation === 'idle' && this.spriteAnimation) {
            this.drawScaledSprite(this.spriteAnimation, this.spriteX, this.spriteY);
        } else if (this.currentAnimation === 'jump' && this.jumpAnimation) {
            this.drawScaledSprite(this.jumpAnimation, this.spriteX, this.spriteY);
        } else if (this.currentAnimation === 'celebrate' && this.celebrateAnimation) {
            this.drawScaledSprite(this.celebrateAnimation, this.spriteX, this.spriteY);
        }
        
        // Draw game assets
        this.assets.forEach(asset => asset.draw(this.ctx));
        
        // Draw floating texts
        this.floatingTexts.forEach(text => text.draw(this.ctx));
    }

    gameLoop(currentTime) {
        if (!this.isRunning) {
            this.animationFrameId = null;
            return;
        }

        this.update(currentTime);
        this.render();

        if (!this.isRunning) {
            this.animationFrameId = null;
            return;
        }

        this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    drawScaledSprite(animation, x, y) {
        const frame = animation.frames[animation.currentFrame];
        const scaledWidth = this.spriteOriginalWidth * this.spriteScale;
        const scaledHeight = this.spriteOriginalHeight * this.spriteScale;
        
        this.ctx.drawImage(
            animation.image,
            frame.frame.x,
            frame.frame.y,
            frame.frame.w,
            frame.frame.h,
            x,
            y,
            scaledWidth,
            scaledHeight
        );
    }

    resizeCanvas() {
        const oldScale = this.spriteScale;
        
        this.canvasWidth = this.canvasParent.clientWidth;
        this.canvasHeight = this.canvasWidth / this.aspectRatio;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Recalculate sprite scale
        this.spriteScale = this.canvasWidth / this.maxCanvasWidth;
        
        // Scale current position proportionally
        const scaleRatio = this.spriteScale / oldScale;
        this.currentSpriteX *= scaleRatio;
        this.currentSpriteY *= scaleRatio;
        
        // Update sprite position to scaled current position
        this.spriteX = this.currentSpriteX;
        this.spriteY = this.currentSpriteY;
        this.baseX = this.spriteX;
        this.baseY = this.spriteY;
        
        // Recalculate scaled jump movements
        this.jumpTotalMoveX = this.baseJumpMoveX * this.spriteScale;
        this.jumpTotalMoveY = this.baseJumpMoveY * this.spriteScale;
        this.jumpMovePerFrameX = this.jumpTotalMoveX / this.jumpMovementFrames;
        this.jumpMovePerFrameY = this.jumpTotalMoveY / this.jumpMovementFrames;
        
        // Update game assets scale and position
        // if (this.assets.length > 0) {
            
        //     // Scale all assets
            for (let i = 0; i < this.assets.length; i++) {

                const scaledAssetX = (this.baseAssetX + (this.baseJumpMoveX * this.assets[i].position)) * this.spriteScale;
                const scaledAssetY = (this.baseAssetY + (this.baseJumpMoveY * this.assets[i].position)) * this.spriteScale;
                
                this.assets[i].x = scaledAssetX
                this.assets[i].baseY = scaledAssetY;
                this.assets[i].y = scaledAssetY;

                this.assets[i].setScale(this.spriteScale);
            }
        // }
        this.render();
    }

    start() {
        this.loadAssets().then(() => {
            console.log('Game ready. Press the Start button to begin the loop.');
        });
    }
}

export { LevelUpGame };
