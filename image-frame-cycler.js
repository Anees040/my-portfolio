function imageFrameCycler(imgContainerSelector, userOptions) {
    const imgContainerElement = document.querySelector(imgContainerSelector);
    const defaultOptions = {
        shouldReverse: false,
        targetFPS: 18,

    };
    const options = {...defaultOptions, ...userOptions};
    

    let lastFrameTime = 0;
    const frameInterval = 1000 / options.targetFPS; // Milliseconds per frame
    let stopCycle = false;
    let animationId;
    let frameNum = 0

    return {
        maybeUpdateDOM: function(index, imgFrames, isForwardCycle) {
            let prevIndex;
            if (isForwardCycle) {
                if (index === 0) {
                    prevIndex = imgFrames.length - 1;
                } else {
                    prevIndex = index - 1;
                }
            } else {
                if (index === imgFrames.length - 1) {
                    prevIndex = 0;
                } else {
                    prevIndex = index + 1;
                }
            }
            imgFrames[index].style.visibility = 'visible';
            imgFrames[prevIndex].style.visibility = 'hidden';
        },
        doFrameCycle: function(timestamp, index, isForwardCycle, frameCycleComplete) {
            // If enough time has passed since the last frame
            if (timestamp - lastFrameTime >= frameInterval) {
                lastFrameTime = timestamp;

                frameNum = frameNum + 1;
                // Get the images (each frame) in the DOM.
                const imgFrames = imgContainerElement.getElementsByTagName('img');
        
                this.maybeUpdateDOM(index, imgFrames, isForwardCycle);
    
                if (options.shouldReverse) {
                    if (isForwardCycle) {
                        if (index === imgFrames.length - 1) {
                            isForwardCycle = false;
                            //index--;
                        } else {
                            index++;
                        }
                    } else {
                        if (index === 0) {
                            frameCycleComplete = true;
                        } else {
                            index--;
                        }  
                    }
                } else {
                    if (index === imgFrames.length - 1) {
                        frameCycleComplete = true;
                    } else {
                        index++;
                    }
                }
            }
    
            if (! frameCycleComplete && ! stopCycle) {
                animationId = requestAnimationFrame((ts) => this.doFrameCycle(ts, index, isForwardCycle, frameCycleComplete)); // Request the next animation frame
            }
            if (stopCycle) {
                animationId && cancelAnimationFrame(animationId);
                if (index !== 2) {
                    // Set the visible image to the original starting position.
                    this.maybeUpdateDOM(2, imgContainerElement.getElementsByTagName('img'));
                    index = 0;
                }
            }
        },
        stopCycler: function() {
            stopCycle = true;
        },
        resetCycler: function() {
            stopCycle = false;
            frameNum = 0;
        },
        resetFrameCount: function() {
            frameNum = 0;
        },
        getFrameCount: function() {
            return frameNum;
        },
    }
    
}
export { imageFrameCycler };
