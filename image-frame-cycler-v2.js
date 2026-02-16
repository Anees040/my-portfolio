function imageFrameCycler(frames, options) {
    const settings = {
        fps: 12,
        shouldReverse: false,
        delayRange: null,
        reverseDelay: 0,
        cycleCount: 1,
        autoStart: true,
        ...options,
    };

    const frameCount = frames.length;
    if (frameCount === 0) {
        return {
            start() {},
            pause() {},
            resume() {},
            stop() {},
            isStopped() { return true; },
        };
    }

    const frameDuration = 1000 / Math.max(1, settings.fps);
    const sequence = buildSequence(frameCount, settings.shouldReverse);
    const forwardLength = frameCount;
    const cycleTarget = Math.max(1, Number(settings.cycleCount) || 1);

    let frameIndex = 0;
    let lastTimestamp = 0;
    let accumulated = 0;
    let rafId = null;
    let isPaused = true;
    let waitUntil = null;
    let cyclesSinceDelay = 0;

    function buildSequence(count, reverse) {
        const forward = Array.from({ length: count }, (_, idx) => idx);
        if (!reverse || count === 1) {
            return forward;
        }
        const backward = [...forward].reverse();
        return forward.concat(backward);
    }

    let visibleIndex = null;

    function setVisibleFrame(index) {
        if (visibleIndex === index) {
            return;
        }
        if (visibleIndex !== null && frames[visibleIndex]) {
            frames[visibleIndex].classList.remove("frame-visible");
        }
        frames[index].classList.add("frame-visible");
        visibleIndex = index;
    }

    function getRandomDelay() {
        if (!settings.delayRange) {
            return 0;
        }
        const min = Math.max(0, settings.delayRange.min ?? settings.delayRange[0] ?? 0);
        const max = Math.max(min, settings.delayRange.max ?? settings.delayRange[1] ?? min);
        return min + Math.random() * (max - min);
    }

    function advanceFrame() {
        setVisibleFrame(sequence[frameIndex]);
        frameIndex += 1;
        if (settings.shouldReverse && frameIndex === forwardLength && settings.reverseDelay > 0) {
            waitUntil = performance.now() + settings.reverseDelay;
        }
        if (frameIndex >= sequence.length) {
            frameIndex = 0;
            if (settings.delayRange) {
                cyclesSinceDelay += 1;
                if (cyclesSinceDelay >= cycleTarget) {
                    const delay = getRandomDelay();
                    if (delay > 0) {
                        waitUntil = performance.now() + delay;
                    }
                    cyclesSinceDelay = 0;
                }
            }
        }
    }

    function tick(timestamp) {
        if (isPaused) {
            rafId = null;
            return;
        }

        if (!lastTimestamp) {
            lastTimestamp = timestamp;
        }

        if (waitUntil && timestamp < waitUntil) {
            rafId = requestAnimationFrame(tick);
            return;
        }

        if (waitUntil && timestamp >= waitUntil) {
            waitUntil = null;
            lastTimestamp = timestamp;
        }

        accumulated += timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        while (accumulated >= frameDuration) {
            advanceFrame();
            accumulated -= frameDuration;
        }

        rafId = requestAnimationFrame(tick);
    }

    function start() {
        if (!isPaused) {
            return;
        }
        isPaused = false;
        lastTimestamp = 0;
        accumulated = 0;
        cyclesSinceDelay = 0;
        
        setVisibleFrame(sequence[frameIndex]);
        rafId = requestAnimationFrame(tick);
    }

    function pause() {
        isPaused = true;
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    }

    function resume() {
        if (!isPaused) {
            return;
        }
        isPaused = false;
        lastTimestamp = 0;
        rafId = requestAnimationFrame(tick);
    }

    function stop() {
        pause();
        frameIndex = 0;
        waitUntil = null;
        cyclesSinceDelay = 0;
        setVisibleFrame(sequence[frameIndex]);
    }

    function isStopped() {
        return isPaused;
    }

    frames.forEach((frame) => {
        frame.classList.remove("frame-visible");
    });

    if (settings.autoStart) {
        start();
    } else {
        setVisibleFrame(sequence[frameIndex]);
    }

    return { start, pause, resume, stop, isStopped };
}


export { imageFrameCycler };