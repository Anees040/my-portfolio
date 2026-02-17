        import { Starfield } from './starfield.js';
        import { ImageAtomizer } from './image-atomizer.js';
        import { imageFrameCycler as imageFrameCyclerV2 } from './image-frame-cycler-v2.js';
        import { Typewriter } from './t-writer.js';
        import { confettea } from './confettea.js';
        import {
            asciiArtToConsole,
            getDeviceType,
            getAtomizerImageSize,
            getElementProps,
            getRandomInt,
            Twinkler,
            timeSince,
            numberWithCommas,
            debounce
        } from './utils.js';
        import { LevelUpGame } from './elliottprogrammer-level-up-game.js';

        asciiArtToConsole();
        let deviceType = getDeviceType();
        let atomizer;
        let starfield;
        let gitSlider;
        let sliderTl;
        let isGitSliderPlaying = false;
        const sliderScrollDuration = 60;
        let sliderDirection = 'forward';
        const supportsSwipeEvents = function() {
            return window && 'ontouchstart' in window;
        }
        let isMobileTouchDevice = supportsSwipeEvents() && (deviceType == 'phone' || deviceType == 'mobile');

        document.addEventListener('DOMContentLoaded', function() {
            // Register GSAP plugins
            gsap.registerPlugin(ScrollTrigger);
            gsap.registerPlugin(CustomEase);
            gsap.registerPlugin(MotionPathPlugin) 

            // Lenis for smooth scrolling
            const lenis = new Lenis();
            // Synchronize Lenis scrolling with GSAP's ScrollTrigger plugin
            lenis.on('scroll', ScrollTrigger.update);
            // Add Lenis's requestAnimationFrame (raf) method to GSAP's ticker
            // This ensures Lenis's smooth scroll animation updates on each GSAP tick
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000); // Convert time from seconds to milliseconds
            });
            // Enable lag smoothing in GSAP to prevent any delay in scroll animations
            gsap.ticker.lagSmoothing(500, 20);
            // Might need to normalizeScroll for Safari mobile browser?
            ScrollTrigger.normalizeScroll(true);
            const shouldUseTextMotionPath = (getDeviceType() === 'desktop' || getDeviceType() === 'tablet');

            initAneesAIChat();

            // Mobile Nav Menu
            const navMenuButton = document.querySelector('.nav-menu-button');
            navMenuButton.addEventListener('click', (e) => {
                const menuBtnElement = e.currentTarget;
                const classes = menuBtnElement.classList;
                if (classes.contains('open')) {
                    menuBtnElement.classList.remove('open');
                } else {
                    menuBtnElement.classList.add('open');
                }
            });

            // Animate Name, Title, & Description (Fade in & up)
            const name = document.querySelector('.name');
            const title = document.querySelector('.title');
            const description = document.querySelector('.description');
            gsap.from( '.name', {
                opacity: 0,
                y: -70,
                duration: 1,
                ease: 'power1.inOut',
                onStart: () => {
                    name.style.visibility = 'visible';
                }
            });

            gsap.from( [title, description], {
                opacity: 0,
                y: 70,
                duration: 1,
                ease: 'power1.inOut',
                onStart: () => {
                    title.style.visibility = 'visible';
                    description.style.visibility = 'visible';
                },
            });

            let hoverMeTimer;
            function showHoverMe() {
                // Hover Me arrow.
                gsap.to( '.hover-me', {
                    delay:1.5,
                    opacity: 1,
                });
                if ( !hoverMeTimer ) {
                    hoverMe();
                }
            }

            const delay = (ms) =>
              new Promise((resolve) => {
                const timer = setTimeout((timer) => {
                  resolve(timer);
                }, ms);
              });

            // HoverMe image shakes every random 1 - 5 seconds
            const hoverMeElem = document.querySelector('.hover-me');
            async function hoverMe() {
                const randomWait = getRandomInt(1500, 5000);
                hoverMeElem.setAttribute('data-animation', 'wobble');
                delay(610).then((timer) => {
                    hoverMeElem.setAttribute('data-animation', '');
                }); // remove just after .6 seconds
                delay(randomWait).then((timer) => {
                  hoverMeTimer = timer;
                  hoverMe();
                }); 
            }

            function getAtomizerCanvasProps() {
                return {
                    navHeight: 62,
                    headingHeight: document.getElementById('intro').clientHeight,
                    get canvasHeight() {
                        return window.innerHeight - this.navHeight;
                    },
                    get canvasCenterHeight() {
                        return this.canvasHeight / 2;
                    },
                    get adjustedCanvasCenterHeight() {
                        return ( this.canvasHeight - this.headingHeight ) / 2;
                    },
                    get offsetY() {
                        return this.canvasCenterHeight - this.adjustedCanvasCenterHeight;
                    }
                };
            }

            function getStarfieldMetaProps() {
                const { height: atmzrImgHeight } = getAtomizerImageSize();
                const { canvasHeight, canvasCenterHeight, offsetY, headingHeight } = getAtomizerCanvasProps();
                const atmzrImageTop = (canvasCenterHeight + offsetY) - ( atmzrImgHeight / 2 );
                
                return {
                    startYMin: Math.round((headingHeight / canvasHeight) * 100) / 100,
                    startYMax: Math.round((atmzrImageTop / canvasHeight) * 100) / 100,
                }
            }
            
            const { startYMin, startYMax } = getStarfieldMetaProps();
            starfield = new Starfield({
                starsCount: 700,
                starsColor: '#cce5ff',
                starsRotationSpeed: 4,
                nebulasIntensity: 14,
                bgColor: 'rgb(5,5,12)',
                originOffsetX: 0,
                originOffsetY: 0,
                metaData: {deviceType, isMobileTouchDevice, startYMin, startYMax},
            });

            function getAtomizerImageSrc(canvasWidth, canvasHeight) {
                if (canvasWidth > 1766) {
                    // Desktop
                    return './images/bryan-elliott-portfolio-headshot-desktop.webp';
                } else if (canvasWidth > 700) {
                    // Tablet
                    return './images/bryan-elliott-portfolio-headshot-tablet.webp';
                } else if (canvasWidth > 450) {
                    // Mobile
                    return './images/bryan-elliott-portfolio-headshot-mobile.webp';
                } else {
                    // Phone
                    return './images/bryan-elliott-portfolio-headshot-phone.webp'
                }
            }

            // Image Atomizer
            function showAtomizer() {
                const { offsetY } = getAtomizerCanvasProps();
                
                const hoverMeElem = document.querySelector('.hover-me');

                function hoverMeSetPosition(canvasWidth, canvasHeight, imageWidth, imageHeight) {
                    const yPos = (canvasHeight / 2) + offsetY - (imageHeight / 2) + (imageHeight * .07);
                    const xPos = (canvasWidth / 2) - (imageWidth / 2) + (imageWidth * .07);
                    hoverMeElem.style.opacity = 0;
                    hoverMeElem.style.top = `${yPos}px`;
                    hoverMeElem.style.left = `${xPos}px`;
                    showHoverMe();
                }

                const atomizerWrapper = document.getElementById('image-atomizer');
                const atomizerCanvas = document.querySelector('canvas.atomizer');
                let logoImgSrc = getAtomizerImageSrc(atomizerWrapper.clientWidth, atomizerWrapper.clientHeight);
                
                function atomizerSizeChange(atomizer, newWidth, newHeight) {
                    deviceType = getDeviceType();
                    isMobileTouchDevice = supportsSwipeEvents() && (deviceType !== 'phone' || deviceType !== 'mobile');
                    const { startYMin, startYMax } = getStarfieldMetaProps(); 
                    starfield.resize({deviceType, isMobileTouchDevice, startYMin, startYMax});
                    // replace the atomizer image when necessary, on viewport size change.
                    const newImageSrc = getAtomizerImageSrc(newWidth, newHeight);
                    if (newImageSrc !== logoImgSrc) {
                        const newImage = new Image();
                        newImage.src = newImageSrc;
                        logoImgSrc = newImageSrc;
    
                        newImage.onload = () => {
                            atomizer.setImage(newImage);
                            hoverMeSetPosition(newWidth, newHeight, newImage.width, newImage.height);
                        };
        
                        newImage.onerror = () => {
                            return console.error('ImageAtomizer: Failed to load a resized image on atomizer resize: (%s). Please check the image exists.', imageSource);
                        }
                    } else {
                        const {width, height} = getAtomizerImageSize();
                        hoverMeSetPosition(newWidth, newHeight, width, height); 
                    }
                }

                atomizer = new ImageAtomizer(logoImgSrc, {
                    particleGap: 0, //getDeviceType() == 'phone' ? 3 : 0,
                    particleSize: 2, //getDeviceType() == 'phone' ? 3 : 1,
                    restless: false,
                    offsetY: offsetY,
                    timeScale: 0.5,
                    enableOffscreenWorker: false,
                    enablePerfLog: false,
                    perfLogInterval: 120,
                    onInitialized: () => {
                        atomizerWrapper.classList.add('has-initialized');
                        const {width, height} = getAtomizerImageSize();
                        hoverMeSetPosition(atomizerWrapper.clientWidth, atomizerWrapper.clientHeight, width, height);
                    },
                    onSizeChange: atomizerSizeChange,
                });
                
                atomizerCanvas.addEventListener('click', function(){atomizer.init()})
            }

            let writer1;

            function onWindowLoad() {
                const target = document.querySelector('.logo');

                const options = {
                    typeColor: 'white',
                    animateCursor: false
                };
                
                writer1 = new Typewriter(target, options);
                writer1.type("anees-portfolio.com").start();

                showAtomizer();

                // Pause and unpause atomizer on scroll in and out of viewport.
                ScrollTrigger.create({
                    trigger: '#image-atomizer',
                    start: 'top bottom',
                    end: 'bottom-=100 top',
                    //markers: true,
                    onEnterBack: (self) => {
                        // When section enters the viewport from the top (when scrolling back up to the top)
                        atomizer.play();
                        //starsNebula.play();
                        starfield.play();
                        if ( !hoverMeTimer ) {
                            hoverMe();
                        }
                    },
                    onLeave: (self) => {
                        // When section leaves the viewport from the top (when scrolling down the page)
                        atomizer.pause();
                        //starfield.pause();
                        starfield.pause();
                        if ( hoverMeTimer ) {
                            clearTimeout(hoverMeTimer);
                            hoverMeTimer = null;
                        }
                    }
                });

            }

            (window.addEventListener
                ? window.addEventListener('load', onWindowLoad, false)
                : window.onload = onWindowLoad);

            const handleTypewriterRestart = debounce( () => {
                writer1.clear().start();
            }, 200);
            
            // About Me Section - Slide up & fade in
            const aboutMeSection1 = document.getElementById('about-me');
            const aboutMeBgText = document.querySelector('#about-me .bg-text-effect');
            const aboutMeTextContainer = document.querySelector('#about-me .two-col > div:first-child');
            const aboutMeImageContainer = document.querySelector('#about-me .two-col > div:last-child');

            gsap.to(aboutMeBgText, {
                x: aboutMeBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: aboutMeSection1,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });

            gsap.set([aboutMeTextContainer, aboutMeImageContainer], {
                transform: 'translateY(200px)',
                opacity: 0,
            })
            gsap.to(aboutMeTextContainer, {
                scrollTrigger: {
                    trigger: aboutMeTextContainer,
                    start: 'top bottom',
                    //markers: true,
                },
                opacity: 1,
                y: 0,
            });
            gsap.to(aboutMeImageContainer, {
                scrollTrigger: {
                    trigger: aboutMeImageContainer,
                    start: 'top bottom',
                },
                opacity: 1,
                y: 0,
                onComplete: () => {
                    if ('phone' === deviceType || 'mobile' === deviceType) {
                        const textTl = gsap.timeline( {delay: 1.5, ease: "power1.inOut" } );
                        textTl.to('#about-me-image .interactive-image-text', {
                            duration: .5,
                            scaleX: 1,
                        }).to('#about-me-image .interactive-image-text .text', {
                            duration: .2,
                            opacity: 1,
                        }).to('#about-me-image .interactive-image-text .text', {
                            delay: .5,
                            duration: .5,
                            x: 0,
                        }, 0).to('#about-me-image .interactive-image-text .text', {
                            delay: 3,
                            duration: .5,
                            xPercent: -80,
                        }).to('#about-me-image .interactive-image-text', {
                            duration: .5,
                            scaleX: 0,
                        });
                    }  
                },
                        
            });

            const dialog = document.getElementById('waterline-cover-dialog');
            const showButton = document.querySelector('.dialog-trigger');
            const closeButton = document.querySelector('.dialog-close-btn');

            // "Show the dialog" button opens the dialog modally
            showButton.addEventListener("click", () => {
                dialog.showModal();
            });

            // "Close" button closes the dialog
            closeButton.addEventListener("click", () => {
                dialog.close();
            });

            dialog.addEventListener('click', (event) => {
                if (event.target === dialog) {
                  dialog.close();
                }
            });

            // Sets Me Apart Section - Slide Up & fade in.
            const setsMeApartSection = document.getElementById('what-sets-me-apart');
            const setsMeApartBgText = document.querySelector('#what-sets-me-apart .bg-text-effect');
            gsap.to(setsMeApartBgText, {
                x: setsMeApartBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: setsMeApartSection,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });

            const setsMeApartText = document.querySelector('#what-sets-me-apart .two-col > div:first-child');
            const setsMeApartImage = document.querySelector('#what-sets-me-apart .two-col > div:last-child');
            gsap.set([setsMeApartText, setsMeApartImage], {
                transform: 'translateY(200px)',
                opacity: 0,
            })
            gsap.to(setsMeApartText, {
                scrollTrigger: setsMeApartText,
                opacity: 1,
                y: 0,
            });
            gsap.to(setsMeApartImage, {
                scrollTrigger: {
                    trigger: setsMeApartImage,
                    start: 'top bottom',
                },
                opacity: 1,
                y: 0,          
            });

            const interactImgTxtTl = gsap.timeline({
                scrollTrigger: {
                    trigger: setsMeApartImage,
                    start: 'bottom+=200px bottom',
                },
                delay: 1.5,
                ease: "power1.inOut",
            } );
            if ('phone' === deviceType || 'mobile' === deviceType) {
                interactImgTxtTl.to('#searching-bugs .interactive-image-text', {
                    duration: .5,
                    scaleX: 1,
                }).to('#searching-bugs .interactive-image-text .text', {
                    duration: .2,
                    opacity: 1,
                }).to('#searching-bugs .interactive-image-text .text', {
                    delay: .5,
                    duration: .5,
                    x: 0,
                }, 0).to('#searching-bugs .interactive-image-text .text', {
                    delay: 3,
                    duration: .5,
                    xPercent: -80,
                }).to('#searching-bugs .interactive-image-text', {
                    duration: .5,
                    scaleX: 0,
                });
            }

            // Level Up Section - Slide up & fade in
            const levelUpTextContainer = document.querySelector('#leveling-up .two-col > div:first-child .content-wrapper');
            const levelUpImageContainer = document.querySelector('#leveling-up .two-col > div:last-child .content-wrapper');
            gsap.set([levelUpTextContainer, levelUpImageContainer], {
                transform: 'translateY(200px)',
                opacity: 0,
            })
            gsap.to(levelUpTextContainer, {
                scrollTrigger: levelUpTextContainer,
                opacity: 1,
                y: 0,
            });
            gsap.to(levelUpImageContainer, {
                scrollTrigger: {
                    trigger: levelUpImageContainer,
                    start: 'top bottom',
                },
                opacity: 1,
                y: 0,       
            });

            // About Me - Blinking Eyes
            const eyesFrames1 = document.querySelectorAll('#about-me-image .frames-container.about-eyes-frames img');
            const eyesBlinker1 = imageFrameCyclerV2(eyesFrames1, {
                fps: 18,
                shouldReverse: true,
                //reverseDelay: 50,
                cycleCount: 2,
                delayRange: { min: 1700, max: 6000 },
                autoStart: false,
            });

            // About Me - Typing Hands
            const typingHandsFrames = document.querySelectorAll('#about-me-image .frames-container.typing-hands img');
            const typingHands = imageFrameCyclerV2(typingHandsFrames, {
                fps: 14,
                shouldReverse: true,
                cycleCount: 8,
                delayRange: { min: 1700, max: 3700 },
                autoStart: false,
            });

            // Searching Bugs - Blinking Eyes
            const eyesFrames2 = document.querySelectorAll('#searching-bugs .frames-container.searching-eyes-frames img');
            const eyesBlinker2 = imageFrameCyclerV2(eyesFrames2, {
                fps: 20,
                shouldReverse: true,
                cycleCount: 2,
                delayRange: { min: 1700, max: 5000 },
                autoStart: false,
            });

            // Searching Bugs - Magnifying Arm
            let armTLDelayedRepeat = null;
            const magnifyArmElem = document.querySelector('#searching-bugs .magnify-arm-container');
            const magnifyArmHandElem = document.querySelector('#searching-bugs .magnify-arm-hand');
            const armTl = gsap.timeline({
                yoyo: true,
                paused: true,
                defaults: {
                    ease: 'power1.out',
                    duration: 1.3,
                },
                onComplete: () => {
                    armTLDelayedRepeat = gsap.delayedCall(gsap.utils.random(2, 7), () => armTl.restart());
                },
            });
            armTl.to(magnifyArmElem, {
                rotation: 16,
            }).to(magnifyArmHandElem, {
                rotation: -12,
            }, '<').to(magnifyArmElem, {
                rotation: -19,
            }).to(magnifyArmHandElem, {
                rotation: 14,
                y: 4,
            }, '<').to(magnifyArmElem, {
                rotation: 0,
            }).to(magnifyArmHandElem, {
                rotation: 0,
                y: 0,
            }, '<');

            // Searching Bugs - Ceiling Fan
            const fanFrames = document.querySelectorAll('#searching-bugs .frames-container.fan-frames img');
            const fanSpinner = imageFrameCyclerV2(fanFrames, {
                fps: 20,
                shouldReverse: false,
                delayRange: null,
                autoStart: false,
            });

            const scrollHandlers = {
                aboutMeImageScrollInCallback: function(target) {
                    eyesBlinker1.start();
                    typingHands.start();
                },
                aboutMeImageScrollOutCallback: function(target) {  
                    eyesBlinker1.stop();
                    typingHands.stop();
                },
                searchingBugsImageScrollInCallback: function(target) { 
                    eyesBlinker2.start();
                    armTl.restart();
                },
                searchingBugsImageScrollOutCallback: function(target) {
                    eyesBlinker2.stop();
                    armTl.pause();
                    if (armTLDelayedRepeat) {
                        armTLDelayedRepeat.kill();
                        armTLDelayedRepeat = null;
                    }
                },
            }

            const scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const callbackName = target.dataset.scrollInCallback;

                        if (callbackName && typeof scrollHandlers[callbackName] === 'function') {
                            scrollHandlers[callbackName](target);
                        }
                    } else {
                        const target = entry.target;
                        const callbackName = target.dataset.scrollOutCallback;

                        if (callbackName && typeof scrollHandlers[callbackName] === 'function') {
                            scrollHandlers[callbackName](target);
                        }
                    }
                });
            }, { threshold: 0.1 });

            const aboutMeImg = document.querySelector('#about-me-image.interactive-image');
            scrollObserver.observe(aboutMeImg);

            const searchingBugsImg = document.querySelector('#searching-bugs.interactive-image');
            scrollObserver.observe(searchingBugsImg);
            
            // Light switch twinkle
            const clickMeTwinkle = document.querySelector('img.click-me-twinkle');
            const lightSwitchTwinkler = new Twinkler(clickMeTwinkle, [1000, 4000]);
            lightSwitchTwinkler.start();

            // Image captions nudge arrows (w/ twinkle)
            const aboutMeCaptionArrow = document.querySelector('#about-me-image-caption .caption-arrow-forward');
            const searchingBugsCaptionArrow = document.querySelector('#searching-bugs-image-caption .caption-arrow-forward');
            const aboutMeArrowTwinkle = document.querySelector('#about-me-image-caption img.twinkle-shine');
            const searchingBugsArrowTwinkle = document.querySelector('#searching-bugs-image-caption img.twinkle-shine');

            let arrow1Timer;
            const arrow1Twinkler = new Twinkler(aboutMeArrowTwinkle, [1000, 3000]);
            function nudgeArrow1Randomly() {
                const randomWait = getRandomInt(1000, 4000);
                gsap.to(aboutMeCaptionArrow, {
                    duration: .2,
                    x: 8,
                    ease: 'none',
                    repeat: 3,
                    yoyo: true,
                    onComplete: () => { arrow1Twinkler.twinkle(); },
                });
                arrow1Timer = setTimeout( nudgeArrow1Randomly, randomWait );
            }
            nudgeArrow1Randomly();

            let arrow2Timer;
            const arrow2Twinkler = new Twinkler(searchingBugsArrowTwinkle, [1000, 3000]);
            function nudgeArrow2Randomly() {
                const randomWait = getRandomInt(1000, 4000);
                gsap.to(searchingBugsCaptionArrow, {
                    duration: .2,
                    x: 8,
                    ease: 'none',
                    repeat: 3,
                    yoyo: true,
                    onComplete: () => { arrow2Twinkler.twinkle(); },
                });
                arrow2Timer = setTimeout( nudgeArrow2Randomly, randomWait );
            }
            nudgeArrow2Randomly();

            // Coffee cup twinkle
            const cupTwinkle = document.querySelector('img.cup-twinkle');
            const cupTwinkler = new Twinkler(cupTwinkle, [3000, 8000]);

            const aboutMeLightGlow = document.querySelector('#about-me-image.interactive-image .glow-light');
            const aboutMeLampLight = document.querySelector('#about-me-image.interactive-image .light-on-container > img');
            const aboutMeLightSwitch = document.querySelector('#about-me-image button.light-switch');
            const coffeeCupHidden = document.querySelector('#about-me-image .coffee-cup-container > img[data-id="0"]');
            const coffeeCupVisible = document.querySelector('#about-me-image .coffee-cup-container > img[data-id="1"]');
            const coffeeCupVisibleWithShadow = document.querySelector('#about-me-image .coffee-cup-container > img[data-id="2"]');
            const coffeeCupButton = document.querySelector('#about-me-image .coffee-cup-btn');

            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            let sounds = {};

            async function loadSound(name, url) {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                sounds[name] = await audioCtx.decodeAudioData(arrayBuffer);
            }

            async function initSound(name, url) {
                try {
                    await loadSound(name, url);
                } catch(err) {
                    console.log('main.js: Error loading sound %s', url);
                    console.log(err);
                }
            }

            async function initAboutMeSounds() {
                await initSound('clickSound', 'audio/click.mp3');
                await initSound('selectSuccessSound', 'audio/select-success.mp3');
                await initSound('taDaSound', 'audio/ta-da.mp3');
                await initSound('swooshSound', 'audio/swoosh.mp3');
                await initSound('squishSound', 'audio/squish.mp3');
                await initSound('levelCompleteSound', 'audio/level-complete.mp3');
            }

            window.addEventListener("load", async () => {
                await initAboutMeSounds();
            });

            function playBuffer(name, time) {
                const src = audioCtx.createBufferSource();
                src.buffer = sounds[name];
                src.connect(audioCtx.destination);
                src.start(time);
                return src;
            }

            let isLightOn = false;
            let hasLightBeenClicked = false;
            let hasFoundCoffee = false;
            
            aboutMeLightSwitch.addEventListener('click', async (e) => {
                hasLightBeenClicked = true;
                if (audioCtx.state === "suspended") {
                    await audioCtx.resume();
                }
                playBuffer('clickSound', audioCtx.currentTime);
                lightSwitchTwinkler.stop();;
                clearTimeout(arrow1Timer);
                const computedStyle = window.getComputedStyle(aboutMeLightGlow);
                const lightOpacity = parseFloat(computedStyle.getPropertyValue('opacity'));
                // If light is ON, turn it OFF.
                if (lightOpacity > 0) {
                    aboutMeLightGlow.style.opacity = 0;
                    aboutMeLampLight.style.visibility = 'hidden';
                    coffeeCupHidden.style.visibility = 'visible';
                    coffeeCupVisible.style.visibility = 'hidden';
                    coffeeCupVisibleWithShadow.style.visibility = 'hidden';
                    isLightOn = false;
                    coffeeCupButton.setAttribute('tabindex', '-1');
                    cupTwinkler.stop();
                    //clearTimeout(twinkleTimer);
                    cupTwinkle.style.visibility = 'hidden';
                // If light is OFF, turn it ON
                } else {
                    aboutMeLightGlow.style.opacity = 1;
                    aboutMeLampLight.style.visibility = 'visible'; 
                    coffeeCupHidden.style.visibility = 'hidden';
                    coffeeCupVisibleWithShadow.style.visibility = 'visible';
                    coffeeCupVisible.style.visibility = 'visible';
                    isLightOn = true;
                    coffeeCupButton.setAttribute('tabindex', '0');
                    cupTwinkle.style.visibility = 'visible';
                    const delay = getRandomInt(500, 2000);
                    function twinkleCupThenStartTwinkler() {
                        cupTwinkler.twinkle();
                        cupTwinkler.start();
                    }
                    setTimeout( twinkleCupThenStartTwinkler, delay );
                    
                }
            });

            // About Me: Challenge Complete!
            const aboutMeImage = document.querySelector('#about-me-image.interactive-image');
            const aboutMeImageCaption = document.querySelector('section#about-me figure figcaption');
            const aboutMeFoundCoffeeDialog = document.querySelector('#about-me-image .coffee-found-dialog');
            const coffeeDialogLine1 = document.querySelector('#about-me-image .coffee-found-dialog .line1');
            const coffeeDialogLine2 = document.querySelector('#about-me-image .coffee-found-dialog .line2');
            const coffeeDialogLine3 = document.querySelector('#about-me-image .coffee-found-dialog .line3');
            const aboutCompleteText1 = document.querySelector('#about-me-image .word1');
            const aboutCompleteText2 = document.querySelector('#about-me-image .word2');
            const aboutCompleteCheck3 = document.querySelector('#about-me-image .check');

            const aboutCompleteTl = gsap.timeline();
            const aboutMeComplete = aboutCompleteTl.from(aboutCompleteText1, {
                duration: 1,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('swooshSound', audioCtx.currentTime);
                },
            })
            .from(aboutCompleteText2, {
                duration: 1,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('swooshSound', audioCtx.currentTime);
                },
            }, 0.3)
            .from(aboutCompleteCheck3, {
                duration: 1,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('levelCompleteSound', audioCtx.currentTime);
                },
            }, 0.8);;
            aboutMeComplete.pause();

            coffeeCupButton.addEventListener('mouseenter', () => {
                if (isLightOn) {
                    coffeeCupVisible.classList.add('hover');
                }
            });
            coffeeCupButton.addEventListener('mouseleave', () => {
                coffeeCupVisible.classList.remove('hover');
            });
            coffeeCupButton.addEventListener('click', async (e) => {
                if (hasFoundCoffee) {
                    return false;
                }
                hasFoundCoffee = true;
                if (audioCtx.state === "suspended") {
                    await audioCtx.resume();
                }
                playBuffer('selectSuccessSound', audioCtx.currentTime);
                cupTwinkler.stop();
                const { height } = getElementProps(aboutMeImage);
                gsap.to(aboutMeFoundCoffeeDialog, {
                    delay: 1,
                    y: (height - (height * .35)) * -1 + 'px',
                    opacity: 1,
                    duration: .5,
                    onComplete: function() {
                        const element = this._targets[0]; // Get the animated element
                        const rect = element.getBoundingClientRect();
                        const xPos = rect.x + (rect.width / 2);
                        const yPos = rect.y - (rect.height / 2);
                        const fettiOrigin = {
                            x: xPos / document.body.clientWidth,
                            y: yPos / document.body.clientHeight,
                        }

                        function showChallengeComplete() {
                            setTimeout(() => {
                                aboutMeComplete.play();
                                typingHands.stop();
                            }, 1000);
                        }
                        playBuffer('taDaSound', audioCtx.currentTime);
                        confettea.burst({
                            particleCount: 80,
                            origin: fettiOrigin
                        });
                        const aboutMeCaptionWriterOptions = { typeColor: 'white', cursorColor: '#0348fa', typeSpeed: 70 };
                        const writer1 = new Typewriter(coffeeDialogLine1, aboutMeCaptionWriterOptions);
                        const writer2 = new Typewriter(coffeeDialogLine2, aboutMeCaptionWriterOptions);
                        const writer3 = new Typewriter(coffeeDialogLine3, aboutMeCaptionWriterOptions);
                        writer1.rest(600).type("You found it!").rest(400).removeCursor().then(writer2.start.bind(writer2)).start();
                        writer2.type(" Thank you! 😃 ").rest(700).removeCursor().then(writer3.start.bind(writer3));
                        writer3.type("I gotta have my coffee!").then(showChallengeComplete);
                        aboutMeImageCaption.innerHTML = `While working, you will usually find me drinking either good, quality coffee, or a can of Coke.`;
                    }
                })
            });

            // Searching Bugs: Fan & Light Switches
            const imageStatus = {
                isFanOn: false,
                isLightOn: false,
            };
            let hasSwitchRecepticleBeenClicked = false;
            
            const lightSwitchImageContainer = document.querySelector('.light-switch-container');
            const lightSwitchImages = lightSwitchImageContainer.getElementsByTagName('img');
            function setSwitchRecepticle(imageStatus) {
                hasSwitchRecepticleBeenClicked = true;
                playBuffer('clickSound', audioCtx.currentTime);
                clearTimeout(arrow2Timer);
                let imageIdToShow;
                const { isFanOn, isLightOn } = imageStatus;
                if( isFanOn && ! isLightOn) {
                    imageIdToShow = 1;
                } else if (! isFanOn && isLightOn) {
                    imageIdToShow = 2;
                } else if (isFanOn && isLightOn) {
                    imageIdToShow = 3;
                } else {
                    imageIdToShow = 0;
                }
                
                for(const element of lightSwitchImages) {
                    if (element.dataset.id == imageIdToShow) {
                        element.style.visibility = 'visible';
                    } else {
                        element.style.visibility = 'hidden';
                    }
                }
            }
            let hasBugDeployed = false;
            let hasFoundBug = false;
            let bugTimeline;
            const searchingBugsImage = document.querySelector('#searching-bugs.interactive-image');
            const searchingBugsDomeLight = document.querySelector('#searching-bugs.interactive-image .fan-dome-light-container > img');
            const searchingBugsLightGlow = document.querySelector('#searching-bugs.interactive-image .cone-light-container > img');
            const searchingBugsLightSwitch = document.querySelector('#searching-bugs button.light-switch');
            const searchingBugsImageCaption = document.querySelector('section#what-sets-me-apart figure figcaption');
            const theBug = document.querySelector('#searching-bugs.interactive-image .the-bug');
            const searchingBugsFoundDialog = document.querySelector('#searching-bugs .searching-bugs-found-dialog');
            const searchingBugsDialogLine1 = document.querySelector('#searching-bugs .searching-bugs-found-dialog .line1');
            const searchingBugsDialogLine2 = document.querySelector('#searching-bugs .searching-bugs-found-dialog .line2');
            const searchingBugsDialogLine3 = document.querySelector('#searching-bugs .searching-bugs-found-dialog .line3');
            const bugsCompleteText1 = document.querySelector('#searching-bugs .word1');
            const bugsCompleteText2 = document.querySelector('#searching-bugs .word2');
            const bugsCompleteCheck3 = document.querySelector('#searching-bugs .check');

            const bugsCompleteTl = gsap.timeline({
                onComplete: () => {
                    armTl && armTl.pause();
                    armTLDelayedRepeat && armTLDelayedRepeat.kill();
                }
            });
            const bugsComplete = bugsCompleteTl.from(bugsCompleteText1, {
                duration: 1.0,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('swooshSound', audioCtx.currentTime);
                },
            })
            .from(bugsCompleteText2, {
                duration: 1.0,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('swooshSound', audioCtx.currentTime);
                },
            }, 0.3)
            .from(bugsCompleteCheck3, {
                duration: 1.0,
                xPercent: -50,
                scale: 0,
                ease: 'elastic.out(.7,0.19)',
                onStart: () => {
                    playBuffer('levelCompleteSound', audioCtx.currentTime);
                },
            }, 0.8);;
            bugsComplete.pause();

            searchingBugsLightSwitch.addEventListener('click', async (e) => {
                if (audioCtx.state === "suspended") {
                    await audioCtx.resume();
                }
                imageStatus.isLightOn = !imageStatus.isLightOn;
                setSwitchRecepticle(imageStatus);
                if (imageStatus.isLightOn) {
                    searchingBugsDomeLight.style.visibility = 'visible';
                    searchingBugsLightGlow.style.visibility = 'visible';
                    maybeDeployBug();
                } else {
                    searchingBugsDomeLight.style.visibility = 'hidden';
                    searchingBugsLightGlow.style.visibility = 'hidden';
                }
            });
            // Start Bug animation around here...
            const searchingBugsFanSwitch = document.querySelector('#searching-bugs button.fan-switch');
            searchingBugsFanSwitch.addEventListener('click', (e) => {
                imageStatus.isFanOn = !imageStatus.isFanOn;
                setSwitchRecepticle(imageStatus);
                if (imageStatus.isFanOn) {
                    fanSpinner.start();
                    maybeDeployBug();
                } else {
                    fanSpinner.stop();
                }
            });
            
            function maybeDeployBug() {
                if (hasBugDeployed) {
                    return;
                }
                const { width, height } = getElementProps(searchingBugsImage);
                const {isFanOn, isLightOn} = imageStatus;
                if (isFanOn && isLightOn) {
                    theBug.style.visibility = 'visible';
                    CustomBounce.create("myBounce", {
                        strength: 0.4,
                        squash: 3,
                        squashID: "myBounce-squash",
                    });
                    bugTimeline = gsap.timeline();
                    bugTimeline
                        // Fall down and bounce
                        .to(theBug, {
                            duration: 0.7,
                            ease: "myBounce",
                            y: height * .52 + 'px',
                            onComplete: () => {
                                // Play bug scuttle sound?
                                // playBuffer('bugScuttleSound', audioCtx.currentTime);
                            }
                        })
                        // Squash (durung bounce at the same time)
                        .to(theBug, {
                            duration: 0.7,
                            scaleX: 1.4,
                            scaleY: 0.6,
                            ease: "myBounce-squash",
                            transformOrigin: "center bottom",
                        }, 0);
                    bugTimeline
                    // Then move across desk, back and forth in loop.
                        .to(theBug, {
                            duration: 5,
                            x: '-=' + width * .05 + 'px',
                            y: '+=' + height * .035 + 'px',
                            repeat: -1,
                            yoyo: true,
                            ease: 'none'
                        })
                        // And wiggle at the same time.
                        .to(theBug, {
                            duration: .1,
                            rotation: 8,
                            ease: 'none',
                        }, 0)
                        .to(theBug, {
                            duration: .1,
                            rotation: -8,
                            repeat: -1,
                            yoyo: true,
                            ease: 'none'
                        });

                    hasBugDeployed = true;
                }
            }

            theBug.addEventListener('click', () => {
                if (hasFoundBug) {
                    return false;
                }
                theBug.classList.add('squished');
                hasFoundBug = true;
                bugTimeline.pause();
                const { width, height } = getElementProps(searchingBugsImage);
                playBuffer('squishSound', audioCtx.currentTime);
                gsap.to(theBug, {
                    duration: .15,
                    scaleY: .2,
                    ease: 'none',
                    transformOrigin: "center bottom",
                });
                gsap.to(searchingBugsFoundDialog, {
                    delay: 1,
                    y: (height - (height * .42)) * -1 + 'px',
                    opacity: 1,
                    duration: .5,
                    onComplete: function() {
                        const element = this._targets[0]; // Get the animated element
                        const rect = element.getBoundingClientRect();
                        const xPos = rect.x + (rect.width / 2);
                        const yPos = rect.y - (rect.height / 2);
                        const fettiOrigin = {
                            x: xPos / document.body.clientWidth,
                            y: yPos / document.body.clientHeight,
                        }

                        function showChallengeComplete() {
                            setTimeout(() => {
                                bugsComplete.play();
                            }, 1000);
                        }
                        playBuffer('taDaSound', audioCtx.currentTime);
                        confettea.burst({
                            particleCount: 80,
                            origin: fettiOrigin
                        });
                        const searchingBugsCaptionWriterOptions = { typeColor: 'white', cursorColor: '#0348fa', typeSpeed: 70 };
                        const writer1 = new Typewriter(searchingBugsDialogLine1, searchingBugsCaptionWriterOptions);
                        const writer2 = new Typewriter(searchingBugsDialogLine2, searchingBugsCaptionWriterOptions);
                        const writer3 = new Typewriter(searchingBugsDialogLine3, searchingBugsCaptionWriterOptions);
                        writer1.rest(600).type("You squashed the bug!").rest(400).removeCursor().then(writer2.start.bind(writer2)).start();
                        writer2.type(" Thank you! 😃 ").rest(700).removeCursor().then(writer3.start.bind(writer3));
                        writer3.type("We're now bug-free!").then(showChallengeComplete);
                        searchingBugsImageCaption.innerHTML = `I strive to ensure my code is clean, bug-fee, easy to read, and easy to maintain.`;
                    }
                })
            });

            // Pause & restart animations activity when browser window loses and regains focus.
            // Listen for window blur event
            window.addEventListener('blur', function() {
                if (hoverMeTimer) {
                    clearTimeout(hoverMeTimer);
                    hoverMeTimer = null;
                }
                // Stop blinking when window loses focus.
                eyesBlinker1.pause();
                eyesBlinker2.pause();
                typingHands.pause();
                armTl && armTl.pause();
                armTLDelayedRepeat && armTLDelayedRepeat.kill();

                if (arrow1Timer) {
                    clearTimeout(arrow1Timer);
                    arrow1Timer = null;
                }
                if (arrow2Timer) {
                    clearTimeout(arrow2Timer);
                    arrow2Timer = null;
                }
                if (lightSwitchTwinkler && lightSwitchTwinkler?.hasStarted) {
                    lightSwitchTwinkler.stop();
                }
                if (cupTwinkler && cupTwinkler?.hasStarted) {
                    cupTwinkler.stop();
                }
                if (fanSpinner && !fanSpinner.isStopped()) {
                    fanSpinner.stop();
                }
            });

            // Listen for window focus event
            window.addEventListener('focus', function() {
                // Start blinking again when window re-focusus.
                if (!hoverMeTimer) {
                    hoverMe();
                }
                // Start blinking eyes again
                eyesBlinker1.resume();
                eyesBlinker2.resume();
                typingHands.resume();
                if ( !hasFoundBug ) {
                    armTl && armTl.restart();
                }

                if (!arrow1Timer && !hasLightBeenClicked) {
                    nudgeArrow1Randomly();
                }
                if (!arrow2Timer && !hasSwitchRecepticleBeenClicked) {
                    nudgeArrow2Randomly();
                }
                if (lightSwitchTwinkler && !lightSwitchTwinkler?.hasStarted && !hasLightBeenClicked) {
                    lightSwitchTwinkler.start();
                }
                if (cupTwinkler && !cupTwinkler?.hasStarted && hasLightBeenClicked && !hasFoundCoffee) {
                    cupTwinkler.start();
                }
                if (fanSpinner && fanSpinner.isStopped() && imageStatus?.isFanOn) {
                    fanSpinner.start();
                }
            });

            function injectMemberSinceDate() {
                const stackMemberSinceElement = document.querySelector('#stack-member-since');
                const githubMemberSinceElement = document.querySelector('#github-member-since');
                const githubYearlyContributionText = document.querySelector('#git-profile-detail-text');
                const stackMemberForString = timeSince('May 5, 2012');
                const githubMemberForString = timeSince('February 19, 2013');
                stackMemberSinceElement.innerHTML = stackMemberForString;
                githubMemberSinceElement.innerHTML = githubMemberForString;
                githubYearlyContributionText.innerText = deviceType === 'phone' ? 'this year' : 'in the last year';
            }
            injectMemberSinceDate();

            const makeImpactSection1 = document.getElementById('make-impact');
            const makeImpactBgText = document.querySelector('#make-impact .bg-text-effect');
            const makeImpactBgTextPath = document.querySelector('#make-impact .text-motion-path .path');
            

            gsap.to(makeImpactBgText, {
                ...(shouldUseTextMotionPath && { motionPath: {
                    path: makeImpactBgTextPath,
                    align: makeImpactBgTextPath,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: 180,
                }}),
                x: makeImpactBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: makeImpactSection1,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });

            // gsap.to(makeImpactBgText, {
            //     x: makeImpactBgText.offsetWidth * -1,
            //     ease: 'none',
            //     scrollTrigger: {
            //         trigger: makeImpactSection1,
            //         scrub: true,
            //         start: 'top+=250 bottom',
            //         end: 'top+=200 top',
            //         //markers: true,
            //     }
            // });

            const stackOverflowH2 = document.querySelector('#make-impact h2#how-i-make-an-impact');
            const stackOverflowText = document.querySelector('#make-impact .two-col > div:first-child');
            const stackOverflowImage = document.querySelector('#make-impact .two-col > div:last-child');
            gsap.set([stackOverflowH2, stackOverflowText, stackOverflowImage], {
                transform: 'translateY(200px)',
                opacity: 0,
            })
            gsap.to(stackOverflowH2, {
                scrollTrigger: stackOverflowH2,
                opacity: 1,
                y: 0,
            });
            gsap.to(stackOverflowText, {
                scrollTrigger: stackOverflowText,
                opacity: 1,
                y: 0,
            });
            gsap.to(stackOverflowImage, {
                scrollTrigger: stackOverflowImage,
                opacity: 1,
                y: 0,
            });

            const reputationVal = document.querySelector('#reputation-val');
            const rankVal = document.querySelector('#rank-val');
            const answersVal = document.querySelector('#answers-val');
            const questionsVal = document.querySelector('#questions-val');
            const reachedVal = document.querySelector('#reached-val');
            gsap.set([reputationVal, rankVal, answersVal, questionsVal, reachedVal], {
                innerText: '',
            })
            gsap.to(reputationVal, {
                scrollTrigger: reputationVal,
                innerText: 4085,
                snap: { innerText: 1 },
                stagger: {
                    onUpdate: function() {
                        this.targets()[0].innerText = numberWithCommas(Math.ceil(this.targets()[0].innerText));
                    },
                }
            });
            gsap.to(rankVal, {
                scrollTrigger: rankVal,
                innerText: 9.3,
                snap: { innerText: 0.1 },
            });
            gsap.to(answersVal, {
                scrollTrigger: answersVal,
                innerText: 174,
                snap: "innerText",
            });
            gsap.to(questionsVal, {
                scrollTrigger: questionsVal,
                innerText: 3,
                snap: "innerText",
            });
            gsap.to(reachedVal, {
                scrollTrigger: reachedVal,
                innerText: 284000,
                snap: { innerText: 1 },
                stagger: {
                    onUpdate: function() {
                        this.targets()[0].innerText = numberWithCommas(Math.ceil(this.targets()[0].innerText));
                    },
                }
            });

            // Open Source Section - Slide up & fade in
            const openSourceSection1 = document.getElementById('open-source');
            const openSourceBgText = document.querySelector('#open-source .bg-text-effect');
            const openSourceBgTextPath = document.querySelector('#open-source .text-motion-path .path');
            const shouldUseOSMotionPath = (getDeviceType() === 'desktop' || getDeviceType() === 'tablet');

            gsap.to(openSourceBgText, {
                ...(shouldUseOSMotionPath && { motionPath: {
                    path: openSourceBgTextPath,
                    align: openSourceBgTextPath,
                    alignOrigin: [0.5, 0.5],
                    // autoRotate: 180,
                }}),
                x: openSourceBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: openSourceSection1,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });

            // gsap.to(openSourceBgText, {
            //     x: openSourceBgText.offsetWidth * -1,
            //     ease: 'none',
            //     scrollTrigger: {
            //         trigger: openSourceSection1,
            //         scrub: true,
            //         start: 'top+=250 bottom',
            //         end: 'top+=200 top',
            //         //markers: true,
            //     }
            // });

            const gitSectionElements = document.querySelectorAll('#open-source .grid-two-col > div');
            for (let element of gitSectionElements) {
                gsap.set(element, {
                    transform: 'translateY(200px)',
                    opacity: 0,
                })
                gsap.to(element, {
                    scrollTrigger: element,
                    opacity: 1,
                    y: 0,
                });
            }

            const calypShippedVal = document.querySelector('#calyp-shipped-val > div.content');
            const calypReviewedVal = document.querySelector('#calyp-reviewed-val > div.content');
            const calypOpenVal = document.querySelector('#calyp-open-val > div.content');
            const jetpackShippedVal = document.querySelector('#jetpack-shipped-val > div.content');
            const jetpackReviewedVal = document.querySelector('#jetpack-reviewed-val > div.content');
            gsap.set([calypShippedVal, calypReviewedVal, calypOpenVal, jetpackShippedVal, jetpackReviewedVal], {
                innerText: '',
            })
            gsap.to(calypShippedVal, {
                scrollTrigger: calypShippedVal,
                innerText: 215,
                snap: { innerText: 1 },
                stagger: {
                    onUpdate: function() {
                        this.targets()[0].innerText = numberWithCommas(Math.ceil(this.targets()[0].innerText));
                    },
                }
            });
            gsap.to(calypReviewedVal, {
                scrollTrigger: calypReviewedVal,
                innerText: 342,
                snap: { innerText: 1 },
            });

            gsap.to(jetpackShippedVal, {
                scrollTrigger: jetpackShippedVal,
                innerText: 67,
                snap: "innerText",
            });
            gsap.to(jetpackReviewedVal, {
                scrollTrigger: jetpackReviewedVal,
                innerText: 133,
                snap: { innerText: 1 },
                stagger: {
                    onUpdate: function() {
                        this.targets()[0].innerText = numberWithCommas(Math.ceil(this.targets()[0].innerText));
                    },
                }
            });

            // Leveling Up Section - Slide up & fade in
            const levelUpSection1 = document.getElementById('leveling-up');
            const levelUpBgText = document.querySelector('#leveling-up .bg-text-effect');
            const path = document.querySelector('#motion-path .path');
            const shouldUseMotionPath = (getDeviceType() === 'desktop' || getDeviceType() === 'tablet');

            gsap.to(levelUpBgText, {
                ...(shouldUseMotionPath && { motionPath: {
                    path: path,
                    align: path,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: 180,
                }}),
                x: levelUpBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: levelUpSection1,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });
            const gameCompleteBanner = document.querySelector('#leveling-up .game-container img.game-complete-banner');
            const gameCallbacks = {
                onLevelsComplete: function() {
                    gsap.to(gameCompleteBanner, {
                        yPercent: -105,
                        opacity: 1,
                        duration: 0.6,
                        delay: .2,
                        ease: 'power1.inOut',
                    });
                },
                onReset: function() {
                    gsap.to(gameCompleteBanner, {
                        opacity: 0,
                        duration: 0.6,
                        ease: 'power1.inOut',
                    });
                    gsap.to(gameCompleteBanner, {
                        yPercent: 0,
                        delay: 1,
                    });
                    
                },
            }

            // Initialize and start the Level Up game.
            const game = new LevelUpGame(gameCallbacks);
            game.start();

            // Start and Stop the game loop when it enters and leaves the viewport.
            const levelingUpSection = document.querySelector('#leveling-up .two-col.left-text-small > div:last-child');
            ScrollTrigger.create({
                trigger: levelingUpSection,
                start: 'top bottom',
                end: 'bottom-=40 top',
                onEnter: () => {
                    game.play();
                },
                onLeave: () => {
                    game.pause();
                },
                onEnterBack: () => {
                    game.play();
                },
                onLeaveBack: () => {
                    game.pause();
                },
                //markers: true,
            });

            // Experience section - Horizontal scroll with globe rotation
            const experienceWrapper = document.getElementById('experience-wrapper');
            const scrollContainer = experienceWrapper.querySelector('.scroll-container');
            const worldContainer = scrollContainer.querySelector('.world-container');
            
            // Calculate the total horizontal distance to scroll
            // The scroll container's width based on the world container position
            const horizontalDistance = 1200; // pixels to scroll horizontally
            
            const earthTimeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#experience-wrapper',
                    start: 'top top',
                    end: '+=3000',
                    scrub: true,
                    pin: true,
                    ...((getDeviceType() === 'mobile' || getDeviceType() === 'phone') && { anticipatePin: 1 }),
                    //markers: true,
                },
            });
            
            // Animate world container horizontal scroll
            earthTimeline.to(worldContainer, {
                x: -horizontalDistance,
                ease: "none",
            }, 0); // Run at the same time as rotation below
            
            // Animate globe rotation - correlates with horizontal movement
            earthTimeline.to('.rotating-element', {
                rotation: -540, // 3 full rotations as you scroll through the 4 positions
                ease: "none",
            }, 0); // Run at the same time as horizontal scroll

            const spritesheetWidth = 1848;
            const frameCount = 14;
            const frameWidth = spritesheetWidth / frameCount;

            // Animate sprite walking across the globe
            gsap.set('.elliott-sprite', { backgroundPosition: '0px 0px' });
            earthTimeline.fromTo('.elliott-sprite', {
                backgroundPosition: '0px 0px',
            }, {
                backgroundPosition: `${-(frameCount - 1) * frameWidth}px 0px`,
                ease: `steps(${frameCount - 1})`,
                duration: .03,
                repeat: 16,
            }, 0);

            gsap.to('.logo-rotation-container img.img-rotate', {
                rotation: 360,
                duration: 40,
                repeat: -1,
                ease: "linear",
            });

            const contactSection1 = document.getElementById('contact');
            const contactBgText = document.querySelector('#contact .bg-text-effect');
            const contactBgPath = document.querySelector('#contact .path');

            gsap.to(contactBgText, {
                ...(shouldUseTextMotionPath && { motionPath: {
                    path: contactBgPath,
                    align: contactBgPath,
                    alignOrigin: [0.5, 0.5],
                    autoRotate: 180,
                }}),
                x: levelUpBgText.offsetWidth * -1,
                ease: 'none',
                scrollTrigger: {
                    trigger: contactSection1,
                    scrub: true,
                    start: 'top+=250 bottom',
                    end: 'top+=200 top',
                    //markers: true,
                }
            });

            // Place random circles in the background of the Elliott AI section
            const container = document.getElementById('anees-ai');
            const numCircles = 60;
            const minSize = 2;
            const maxSize = 10;

            function getRandomColor() {
                const r = getRandomInt(50, 120);
                const g = getRandomInt(150, 250);
                const b = getRandomInt(230, 255);
                return `rgb(${r}, ${g}, ${b})`;
            }

            function createRandomCircles() {
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;

                for (let i = 0; i < numCircles; i++) {
                    const size = getRandomInt(minSize, maxSize);
                    
                    // Calculate random position within container bounds, accounting for circle size
                    const x = getRandomInt(0, containerWidth - size);
                    const y = getRandomInt(0, containerHeight - size);

                    const circle = document.createElement('div');
                    circle.classList.add('circle');
                    
                    // Apply random size, position, and color
                    circle.style.width = `${size}px`;
                    circle.style.height = `${size}px`;
                    circle.style.left = `${x}px`;
                    circle.style.top = `${y}px`;
                    circle.style.backgroundColor = getRandomColor();

                    container.prepend(circle);
                }
            }

            createRandomCircles();

            // gsap.to(contactBgText, {
            //     x: contactBgText.offsetWidth * -1,
            //     ease: 'none',
            //     scrollTrigger: {
            //         trigger: contactSection1,
            //         scrub: true,
            //         start: 'top+=100 bottom',
            //         end: 'top top',
            //         //markers: true,
            //     }
            // });

            const pupils = document.querySelectorAll(".logo-rotation-container .pupil");
            const movePupils = (mouseX, mouseY) => {
                pupils.forEach((pupil) => {
                    // Get the position of the eye relative to the viewport
                    const rect = pupil.parentElement.getBoundingClientRect();
                    const eyeCenterX = rect.left + rect.width / 2;
                    const eyeCenterY = rect.top + rect.height / 2;

                    // atan2 is used for precise angle calculation
                    // if mouseX & mouseY == 0, angle is 0.
                    const angle = mouseX === 0 && mouseY === 0 ? 0 : Math.atan2(mouseX - eyeCenterX, mouseY - eyeCenterY);

                    // Limit the pupil movement (e.g., to a radius of 4)
                    const maxMove = 4;
                    // Use sine and cosine of the angle to determine the new x and y positions
                    const x = Math.sin(angle) * maxMove + "px";
                    const y = angle === 0 ? '0px' : Math.cos(angle) * maxMove + "px";

                    // Apply the transform
                    // Using translate3d can improve performance
                    pupil.style.transform = `translate3d(-50%, -50%, 0) translate(${x}, ${y})`;
                });
            };

            const tiltElliottProgrammer = (mouseX, mouseY) => {
                const elliottProgrammer = document.querySelector(".logo-rotation-container");
                const rect = elliottProgrammer.getBoundingClientRect();
                const centerX = rect.left + (rect.width / 2);
                const centerY = rect.top + (rect.height / 2);

                const dx = mouseX - centerX;
                const dy = mouseY - centerY;
                let maxX, maxY;
                if (mouseX >= centerX) {
                    maxX = window.innerWidth - centerX;
                } else {
                    maxX = centerX;
                }
                if (mouseY >= centerY) {
                    maxY = window.innerHeight - centerY;
                } else {
                    maxY = centerY;
                }

                const normalizedX = dx / maxX; 
                const normalizedY = dy / maxY;

                const offsetX = mouseX === 0 ? 0 : normalizedX * 25;
                const offsetY = mouseY === 0 ? 0 : normalizedY * 25 * -1;

                elliottProgrammer.style.setProperty('--rotateX', `${offsetY}deg`);
                elliottProgrammer.style.setProperty('--rotateY', `${offsetX}deg`);
            }

            const handleMovePupils = (e) => {
                if (supportsSwipeEvents()) {
                    movePupils(e.touches[0].clientX, e.touches[0].clientY);
                } else {
                    movePupils(e.clientX, e.clientY);
                }
            }
            const handleResetPupils = (e) => {
                movePupils(0, 0);
            }
            const handleTiltElliottProgrammer = (e) => {
                if (supportsSwipeEvents()) {
                    tiltElliottProgrammer(e.touches[0].clientX, e.touches[0].clientY);
                } else {
                    tiltElliottProgrammer(e.clientX, e.clientY);
                }
            }
            const handleResetElliottProgrammer = (e) => {
                tiltElliottProgrammer(0, 0);
            }

            // Tap/Drag gesture icon animation timeline
            let tapGesturePlayCount = 0;
            const tapGestureContainer = document.querySelector('.tap-to-tilt-container');
            const tapGestureIcon = document.querySelector('.tap-to-tilt-icon');
            const containerWidth = document.querySelector('.right')?.clientWidth ?? 500;
            const tapTl = gsap.timeline({
                defaults: {
                    ease: 'power1.inOut',
                },
                paused: true,
                onComplete: () => {
                    // Blink on left side, then blink on right side, then stop.
                    ++tapGesturePlayCount;
                    if (tapGesturePlayCount <= 1) {
                        if (tapGestureContainer.classList.contains('right-side')) {
                            tapGestureContainer.classList.remove('right-side');
                        } else {
                            tapGestureContainer.classList.add('right-side');
                        }
                    
                        gsap.delayedCall(1, () => {
                            tapTl.play(0);
                        });
                    }
                },
            });
            // Blink tapGestureIcon (hand tap icon) twice.
            tapTl.to(tapGestureIcon, {
                duration: 0.3,
                opacity: 1,
            }, '+=0.1').to(tapGestureIcon, {
               opacity: 0,
                duration: 0.3,
            }, '+=0.3').to(tapGestureIcon, {
                opacity: 1,
                duration: 0.3,
            }, '+=0.1').to(tapGestureIcon, {
               opacity: 0,
                duration: 0.3,
            }, '+=0.3');

            const rotatingTiltContainer = document.querySelector('#contact .right');
            ScrollTrigger.create({
                trigger: rotatingTiltContainer,
                start: 'top bottom',
                end: 'top+=150 top',
                onEnter: (self) => {
                    if (isMobileTouchDevice) {
                        // Show tap gesture icon animation on mobile devices
                        gsap.delayedCall(2, () => {
                            tapTl.play(0);
                        });
                    }   
                },
                onLeaveBack: (self) => {
                    if (isMobileTouchDevice) {
                        // Reset tap gesture icon animation when scrolling back up
                        tapTl.pause();
                        tapTl.time(0);
                    }
                },
            });

            /**
             * Add movePupils eventListeners only when Contact section is in view.
             * And remove eventListeners when its scrolled out of view.
             * 
             * Only "onEnter" and "onLeaveBack" are currently being used (because the
             * Contact section is so close to the end of the web page)
             */ 
            ScrollTrigger.create({
                trigger: '.logo-rotation-container',
                start: 'top bottom',
                end: 'bottom top',
                onEnter: (self) => {
                    // When section enters viewport from the bottom (when scrolling down the page)
                    if (isMobileTouchDevice) {
                        // Mobile touch events
                        window.addEventListener("touchstart", handleMovePupils);
                        window.addEventListener("touchmove", handleMovePupils);
                        window.addEventListener("touchend", handleResetPupils);
                        window.addEventListener("touchstart", handleTiltElliottProgrammer);
                        window.addEventListener("touchmove", handleTiltElliottProgrammer);
                        window.addEventListener("touchend", handleResetElliottProgrammer);
                    } else {
                        // Mouse event
                        window.addEventListener("mousemove", handleMovePupils);
                        window.addEventListener("mousemove", handleTiltElliottProgrammer);
                        document.addEventListener("mouseleave", handleResetPupils);
                        document.addEventListener("mouseleave", handleResetElliottProgrammer);
                    }
                },
                onEnterBack: (self) => {
                    // When section enters the viewport from the top (when scrolling back up to the top)
                    // Not currenty in use. 
                    if (!isMobileTouchDevice) {
                        window.addEventListener("mousemove", handleMovePupils);
                        window.addEventListener("mousemove", handleTiltElliottProgrammer);
                        document.addEventListener("mouseleave", handleResetPupils);
                        document.addEventListener("mouseleave", handleResetElliottProgrammer);
                    }
                },
                onLeaveBack: (self) => {
                    // When section leaves the viewport from the bottom (when scrolling back up to the top)
                    movePupils(0, 0);
                    tiltElliottProgrammer(0, 0);
                    if (isMobileTouchDevice) {
                        // Mobile touch events
                        window.removeEventListener("touchstart", handleMovePupils);
                        window.removeEventListener("touchmove", handleMovePupils);
                        window.removeEventListener("touchend", handleResetPupils);
                        window.removeEventListener("touchstart", handleTiltElliottProgrammer);
                        window.removeEventListener("touchmove", handleTiltElliottProgrammer);
                        window.removeEventListener("touchend", handleResetElliottProgrammer);
                    } else {
                        // Mouse event
                        window.removeEventListener("mousemove", handleMovePupils);
                        window.removeEventListener("mousemove", handleTiltElliottProgrammer);
                        document.removeEventListener("mouseleave", handleResetPupils);
                        document.removeEventListener("mouseleave", handleResetElliottProgrammer);
                    } 
                },
                onLeave: (self) => {
                    // When section leaves the viewport from the top (when scrolling down the page)
                    // Not currently in use.
                    if (!isMobileTouchDevice) {
                        window.removeEventListener("mousemove", handleMovePupils);
                        window.removeEventListener("mousemove", handleTiltElliottProgrammer);
                        document.removeEventListener("mouseleave", handleResetPupils);
                        document.removeEventListener("mouseleave", handleResetElliottProgrammer);
                    }
                }
            });

            // Show/Hide Dropdown(s) - Contact section in this case.
            const showHideTriggers = document.querySelectorAll('[data-attr="show-hide"]');
            const SHOW_HIDE_ANIMATION_MS = 300;

            function matchCase(original, replacement) {
                if (original === original.toUpperCase()) return replacement.toUpperCase();
                if (original[0] === original[0].toUpperCase()) {
                    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
                }
                return replacement.toLowerCase();
            }

            function updateTriggerText(trigger, isExpanded) {
                const text = trigger.textContent;

                const match = text.match(/(open|show|close|hide)/i);
                if (!match) return;

                const nextWord = match[1].toLowerCase() === 'open' || match[1].toLowerCase() === 'close'
                    ? (isExpanded ? 'close' : 'open')
                    : (isExpanded ? 'hide' : 'show');
                const replacement = matchCase(match[1], nextWord);
                trigger.textContent = text.replace(match[0], replacement);
            }

            function expandSection(section) {
                section.style.display = 'block';
                section.style.maxHeight = '0px';
                requestAnimationFrame(() => {
                    const targetHeight = section.scrollHeight;
                    section.style.maxHeight = `${targetHeight}px`;
                });

                const onEnd = () => {
                    section.style.maxHeight = 'none';
                    section.removeEventListener('transitionend', onEnd);
                };

                section.addEventListener('transitionend', onEnd);
            }

            function collapseSection(section) {
                const currentHeight = section.scrollHeight;
                section.style.maxHeight = `${currentHeight}px`;
                requestAnimationFrame(() => {
                    section.style.maxHeight = '0px';
                });

                const onEnd = () => {
                    section.style.display = 'none';
                    section.removeEventListener('transitionend', onEnd);
                };

                section.addEventListener('transitionend', onEnd);
            }

            function initShowHideDropdowns() {
                showHideTriggers.forEach((trigger, index) => {
                    const content = trigger.nextElementSibling;
                    if (!content) return;

                    content.style.overflow = 'hidden';
                    content.style.maxHeight = '0px';
                    content.style.display = 'none';
                    content.style.transition = `max-height ${SHOW_HIDE_ANIMATION_MS}ms ease`;
                    trigger.setAttribute('aria-expanded', 'false');
                    trigger.setAttribute('aria-controls', `show-hide-panel-${index}`);
                    content.id = content.id || `show-hide-panel-${index}`;

                    trigger.addEventListener('click', () => {
                        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
                        if (isOpen) {
                            collapseSection(content);
                        } else {
                            expandSection(content);
                        }
                        trigger.setAttribute('aria-expanded', String(!isOpen));
                        updateTriggerText(trigger, !isOpen);
                    });
                });
            }

            initShowHideDropdowns();

            const submitButton = document.querySelector('#contact .form-container form button[type="submit"]');
            const submitButtonSendIcon = submitButton.querySelector('span svg.btn-icon.send');
            const submitButtonSpinnerIcon = submitButton.querySelector('span svg.btn-icon.spinner');
            const formResponseWrapper = document.querySelector('#contact .form-container form #form-response');
            const formResponseContainer = document.querySelector('#contact .form-container form #form-response span');

            const handleSubmit = event => {
                event.preventDefault();
                submitButton.disabled = true;
                submitButtonSendIcon.style.display = 'none';
                submitButtonSpinnerIcon.style.display = 'inline';

              
                const myForm = event.target;
                const formData = new FormData(myForm);

                formResponseContainer.addEventListener('transitionend', function(event) {
                    // Code to execute after the transition is complete
                    console.log('Transition finished for property: ' + event.propertyName);
                    formResponseContainer.textContent = '';
                    formResponseWrapper.className = '';
                    
                    formResponseContainer.removeEventListener('transitionend', arguments.callee);
                });
              
                fetch("/", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams(formData).toString()
                })
                .then(() => {
                    formResponseWrapper.classList.add('success');
                    formResponseContainer.textContent = "Form successfully submitted!";
                })
                .catch(error => {
                    formResponseWrapper.classList.add('error');
                    formResponseContainer.textContent = `I'm sorry, there was a problem submitting the form: ${error}`;
                })
                .finally(() => {
                    submitButtonSendIcon.style.display = 'inline';
                    submitButtonSpinnerIcon.style.display = 'none';
                    myForm.reset();
                    setTimeout(() => {
                        submitButton.disabled = false;
                        formResponseContainer.style.opacity = 0; // Has CSS transition attached. This triggers the transitionend event listener above ⬆.
                    }, 6000)
                });
              };
              
              document.querySelector('#contact .form-container form[name="anees-contact"]').addEventListener("submit", handleSubmit);
        });
   
        function gitSliderStart() {   
            // Git Contribution Slider
            const slider = document.getElementById('git-contribution-slider');
            const sliderViewport = slider.querySelector('.slider-viewport');
            const sliderContent = slider.querySelector('.slider-content');
            const slides = slider.querySelectorAll('.slide');
            const prevBtn = slider.querySelector('.prev');
            const nextBtn = slider.querySelector('.next');
            const playBtn = slider.querySelector('.play');
            const pauseBtn = slider.querySelector('.pause');
            let totalSlidesWidth = 0;

            // Set slide images manually and count total width
            slides.forEach( (slide, index) => {
                totalSlidesWidth += slide.clientWidth;
            });
 
            // Total scroll length
            const maxScrollPos = totalSlidesWidth - sliderViewport.clientWidth + 4;
            // Set initial scroll state
            sliderViewport.scrollLeft = maxScrollPos;

            sliderViewport.addEventListener('scroll', (e) => {
                prevBtn.disabled = sliderViewport.scrollLeft === 0;
                nextBtn.disabled = sliderViewport.scrollLeft === maxScrollPos;
            });
            
            // Event listeners for navigation buttons
            prevBtn.addEventListener('click', () => {
                if (sliderViewport.scrollLeft > 0) {
                    if (sliderTl) {
                        sliderTl.pause();
                        isGitSliderPlaying = false;
                        pauseBtn.style.visibility = 'hidden';
                        playBtn.style.visibility = 'visible';
                    }
                    // get "prev" scrollLeft position
                    let prevSlidePos;
                    Array.from(slides).reduce((accum, slide, index) => {
                        const slideWidth = slide.clientWidth;
                        if (sliderViewport.scrollLeft >= accum && sliderViewport.scrollLeft < accum + slideWidth ) {
                            if (sliderViewport.scrollLeft - accum < 10) {
                                prevSlidePos = accum - slides[index - 1].clientWidth; 
                            } else {
                                prevSlidePos = accum;
                            }
                        }
                        return accum + slideWidth;
                    }, 0);
                    sliderDirection = 'forward';
                    // Then gsap animate to that position.
                    gsap.to(sliderViewport, {
                        scrollLeft: prevSlidePos,
                        overwrite: 'none',
                    });
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (sliderViewport.scrollLeft < maxScrollPos) {
                    if (sliderTl) {
                        sliderTl.pause();
                        isGitSliderPlaying = false;
                        pauseBtn.style.visibility = 'hidden';
                        playBtn.style.visibility = 'visible';
                    }
                    // Get "next" scrollLeft position
                    let nextSlidePos;
                    Array.from(slides).reduce((accum, slide, index) => {
                        const slideWidth = slide.clientWidth;
                        if (sliderViewport.scrollLeft >= accum && sliderViewport.scrollLeft <= accum + slideWidth ) {
                            const nextSlide = accum + slideWidth;
                            if (nextSlide > maxScrollPos) {
                                nextSlidePos = maxScrollPos
                            } else {
                                nextSlidePos = nextSlide;
                            }
                        }
                        return accum + slideWidth;
                    }, 0);
                    sliderDirection = 'reverse';
                    // Then gsap animate to that position.
                    gsap.to(sliderViewport, {
                        scrollLeft: nextSlidePos,
                        overwrite: 'none',
                    });
                }
            });

            playBtn.addEventListener('click', () => {
                if (sliderTl) {
                    const scrollPos = sliderViewport.scrollLeft;
                    const scrollAmtPerSecond = maxScrollPos / sliderScrollDuration;
                    const timeAtScrollPos = (maxScrollPos - scrollPos) / scrollAmtPerSecond;
                    sliderTl.seek(timeAtScrollPos);
                    if (sliderDirection === 'reverse') {
                        if (timeAtScrollPos === 0) {
                            sliderTl.play();
                            sliderDirection = 'forward';
                        } else {
                            sliderTl.reverse();
                        }
                    } else {
                        sliderTl.play();
                    }
                    isGitSliderPlaying = true;
                    playBtn.style.visibility = 'hidden';
                    pauseBtn.style.visibility = 'visible';
                }
            });

            pauseBtn.addEventListener('click', () => {
                if (sliderTl) {
                    sliderTl.pause();
                    isGitSliderPlaying = false;
                    pauseBtn.style.visibility = 'hidden';
                    playBtn.style.visibility = 'visible';
                }
            });
            

            gitSlider = document.querySelector('#git-contribution-slider .slider-viewport');
            sliderTl = gsap.timeline({
                scrollTrigger: {
                    trigger: gitSlider,
                    scrub: false,
                    start: "top bottom",
                    end: "top top",
                    //markers: true,
                    onEnter: ({isActive}) => {
                        isGitSliderPlaying = isActive;
                        playBtn.style.visibility = 'hidden';
                        pauseBtn.style.visibility = 'visible';
                    },
                    toggleActions: 'play pause resume pause',
                },
            });
            sliderTl.to(gitSlider, {
                scrollLeft: 0,
                duration: sliderScrollDuration,
                repeat: -1,
                yoyo: true,
                ease: 'none',
                overwrite: 'none',
                onRepeat: () => {
                    sliderDirection = sliderDirection === 'forward' ? 'reverse' : 'forward';
                },
                onReverseComplete: () => {
                    sliderTl.play();
                    sliderDirection = 'forward';
                },
            });
            
            [slides[0], slides[1], slides[2], slides[3], slides[4], slides[5]].forEach((slide, index) => {
                const year = slide.querySelector('.year-text');

                ScrollTrigger.create({
                    trigger: year,
                    toggleClass: 'active',
                    start: `left left`,
                    end: `right left+=170`,
                    horizontal: true,
                    scroller: sliderViewport,
                    pin: true,
                    //markers: true,
                });
            })
        };

        const CONTRIBUTIONS_ENDPOINT = '/.netlify/functions/git-contributions';

        async function registerContributionServiceWorker() {
            if (!('serviceWorker' in navigator)) {
                return null;
            }
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                await navigator.serviceWorker.ready;
                return registration;
            } catch (err) {
                console.error('Contribution service worker registration failed:', err);
                return null;
            }
        }

        async function fetchContributions(url) {
            const response = await fetch(url);
      
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return data;
        }

        (async () => {
            await registerContributionServiceWorker();

            fetchContributions(CONTRIBUTIONS_ENDPOINT)
                .then( data => {
                    renderGitContributions(data);
                    invokeTooltipFunctionality();
                    setTimeout( () => {
                        gitSliderStart();
                    }, 500);
                })
                .catch( err => {
                    console.error(err);
                });
        })();

        function getOrdinalSuffix( day ) {
            if (day > 3 && day < 21) { // Handles 11th, 12th, 13th, etc.
                return 'th';
            }
            switch (day % 10) {
                case 1:
                    return 'st';
                case 2:
                    return 'nd';
                case 3:
                    return 'rd';
                default:
                    return 'th';
            }
        }

        function generateContributionDayMarkup( gitDay ) {
            const date = new Date(gitDay.date);
            const dayOfMonth = date.getDate();
            const month = date.toLocaleDateString('en-US', {
                month: 'long',
            });
            const suffix = getOrdinalSuffix(dayOfMonth);
            const tooltipText = `${gitDay.contributionCount} contributions on ${month} ${dayOfMonth}${suffix}.`;
        
            return `<button class="day day-${gitDay.date} has-tooltip activity-${gitDay.contributionCount > 5 ? 5 : gitDay.contributionCount}" data-tooltip-text="${tooltipText}"></button>
                                    `;
        }

        function renderGitContributions(data) {
            const elementToInsertHtml = document.querySelector('.git-contribution-container .slider .slider-content');
            // Sort from earliest to latest, i.e.- 2020 -> 2025
            data.sort((a, b) => a.year - b.year);
            // Iterate, generate markup, and insert into DOM
            for (let year of data) {
                const yearText = year.year;
                const totalYearContributions =  year.total_contributions
                const weeks = year.weeks;
                const firstWeek = weeks[0].contributionDays;
                const lastWeek = weeks[weeks.length - 1].contributionDays;

                let markup = `
                        <div class="slide">
                            <div class="year">
                                <div class="week">
                                    `;
                const firstWeekOffset = 7 - firstWeek.length; //3
                for(let i = 0; i < firstWeekOffset; i++) {
                    markup += `<div class="day activity-0"></div>
                                    `
                }
                for(let i = 0; i < firstWeek.length; i++) {
                    markup += generateContributionDayMarkup(firstWeek[i]);
                }
                markup += `</div> <!-- end .week -->
                                    `;
    
                // MIDDLE WEEKS
                
                for(let i = 1; i <= weeks.length - 1; i++) {
                    markup += `<div class="week">
                                    `;
                    for(let day of weeks[i].contributionDays) {
                        markup += generateContributionDayMarkup(day);
                    }
                    markup += `</div> <!-- end .week -->
                                ` 
                }
    
                // Last week
                // markup += `<div class="week">
                //                     `;
                // const lastWeekOffset = 7 - lastWeek.length;
                // for(let i = 0; i < lastWeekOffset; i++) {
                //     markup += `<div class="day activity-0"></div>
                //                 `
                // }
                // for(let i = 0; i < lastWeek.length; i++) {
                //     markup += generateContributionDayMarkup(lastWeek[i]);
                // }
                // markup += `</div> <!-- end .week -->
                //                `;
                markup += `</div> <!-- end .year -->
                            `;
                markup += `<div class="year-text">${yearText}</div>
                        `;
                markup += `</div> <!-- end .slide -->`;
                elementToInsertHtml.insertAdjacentHTML('beforeend', markup);
            }    
        }

        function invokeTooltipFunctionality() {
            function getMouseXRelativeToParent(event, parentElement) {
                const parentBounds = parentElement.getBoundingClientRect();
                const mouseX = event.clientX;
                const mouseY = event.clientY;
                return {
                    relativeX: mouseX - parentBounds.left,
                    relativeY: mouseY - parentBounds.top,
                };
            }
            function getTooltipInBoundsOffsets(parentElem, targetElem, event) {
                const xThreshold = targetElem.clientWidth / 2;
                const yThreshold = 25;
                const { relativeX, relativeY } = getMouseXRelativeToParent(event, parentElem);
                const parentWidth = parentElem.offsetWidth;
                let xOffset = 0;
                let yOffset = 0;
                // Check if near the top
                if (relativeY < yThreshold) {
                    yOffset = 45;
                }
                // Check if near the left side
                if (relativeX < xThreshold) {
                    // Move tooltip more to the right (positive amount).
                    xOffset = (xThreshold - relativeX) + 3;
                } 
                // Check if near the right side
                else if (relativeX > parentWidth - xThreshold) {
                    // Move tooltip more to the left (negative amount).
                    xOffset = (xThreshold - ((parentWidth - relativeX) - 3)) * -1;
                }
                return {
                    xOffset,
                    yOffset,
                };
            }
            function handleTooltipOpen(e) {
                const tooltipText = e.target.getAttribute('data-tooltip-text');
                const tooltipSpan = document.createElement('span');
                tooltipSpan.classList.add('git-tooltip');
                tooltipSpan.textContent = tooltipText;
                e.target.appendChild(tooltipSpan);
                const parentDiv = document.querySelector('.slider-viewport');
                
                const { xOffset, yOffset } = getTooltipInBoundsOffsets(parentDiv, tooltipSpan, e);
                tooltipSpan.style.transform = `translate(${(tooltipSpan.clientWidth / 2) * -1 + xOffset}px, ${-10 + yOffset}px)`;
                requestAnimationFrame(() => {
                    tooltipSpan.style.opacity = 1; 
                });
            }
            function handleTooltipClose(e) {
                const tooltipSpan = e.target.querySelector('.git-tooltip');
                tooltipSpan && tooltipSpan.remove();
            }

            const gitBoxes = document.querySelectorAll('button.day.has-tooltip');
            gitBoxes.forEach(gitBox => {
                gitBox.addEventListener('mouseenter', handleTooltipOpen);
                //gitBox.addEventListener('focus', handleTooltipOpen);
                gitBox.addEventListener('mouseleave', handleTooltipClose);
                //gitBox.addEventListener('blur', handleTooltipClose);
            });
        }

        function initAneesAIChat() {
            const form = document.getElementById('anees-ai-form');
            const input = document.getElementById('anees-ai-input');
            const exampleQuestions = document.querySelectorAll('#ai-example-questions button')
            const log = document.getElementById('anees-ai-log');
            const submit = document.getElementById('anees-ai-submit');

            if (!form || !input || !log || !submit) {
                return;
            }

            const decoder = new TextDecoder();

            const scrollToBottom = () => {
                log.scrollTop = log.scrollHeight;
            };

            const appendMessage = (role, text = '') => {
                const wrapper = document.createElement('div');
                wrapper.className = `chat-message ${role}`;
                const bubble = document.createElement('div');
                bubble.className = 'bubble';
                bubble.textContent = text;
                if (role === 'assistant') {
                    const loadingSpan = document.createElement('span');
                    loadingSpan.className = 'loading';
                    loadingSpan.textContent = 'Thinking';
                    bubble.appendChild(loadingSpan);
                }
                wrapper.appendChild(bubble);
                log.appendChild(wrapper);
                scrollToBottom();
                return bubble;
            };

            const setLoading = (isLoading) => {
                submit.disabled = isLoading;
                input.disabled = isLoading;
                submit.textContent = isLoading ? 'Thinking…' : 'Ask';
            };

            async function streamQuestion(question) {
                const assistantBubble = appendMessage('assistant', '');
                let answer = '';
                let buffer = '';

                try {
                    const response = await fetch('/.netlify/functions/anees-ai', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question }),
                    });

                    if (!response.ok || !response.body) {
                        throw new Error(`Request failed (${response.status})`);
                    }

                    const reader = response.body.getReader();
                    while (true) {
                        const { value, done } = await reader.read();
                        if (done) break;
                        buffer += decoder.decode(value, { stream: true });
                        const events = buffer.split('\n\n');
                        buffer = events.pop();
                        for (const raw of events) {
                            const line = raw.trim();
                            if (!line.startsWith('data:')) continue;
                            const payload = line.replace(/^data:\s*/, '');
                            if (!payload) continue;
                            let parsed;
                            try {
                                parsed = JSON.parse(payload);
                            } catch (err) {
                                continue;
                            }

                            if (parsed.type === 'token') {
                                answer += parsed.token;
                                assistantBubble.textContent = answer;
                                scrollToBottom();
                            } else if (parsed.type === 'error') {
                                throw new Error(parsed.message || 'Unknown error');
                            }
                        }
                    }
                } catch (err) {
                    assistantBubble.textContent = `Sorry, something went wrong: ${err.message}`;
                } finally {
                    setLoading(false);
                }
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const question = input.value.trim();
                if (!question) return;

                appendMessage('user', question);
                input.value = '';
                setLoading(true);
                streamQuestion(question);
            });
            exampleQuestions.forEach(questionEl => {
                if (!questionEl?.dataset?.question)
                    return;

                questionEl.addEventListener('click', (e) => {
                    if (e.target.dataset.question) {
                        appendMessage('user', e.target.dataset.question);
                        setLoading(true);
                        streamQuestion(e.target.dataset.question);
                    }
                });
            });
        }

        function injectFooterYear() {
            const footerYearSpan = document.getElementById('footer-current-year');
            if (footerYearSpan) {
                const currentYear = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"})).getFullYear();
                footerYearSpan.textContent = currentYear;
            }
        }
        
        injectFooterYear();

        export { getDeviceType };
            
