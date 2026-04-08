(function () {
    'use strict';

    const padWrap = document.getElementById('mobile-pad-wrap');
    const jumpWrap = document.getElementById('mobile-jump-wrap');
    const stickEl = document.getElementById('pad-stick-el');
    const overlay = document.getElementById('rotate-overlay');

    if (!padWrap || !jumpWrap || !stickEl || !overlay) return;

    const heldKeys = Object.create(null);
    let stickTouchId = null;
    const jumpTouchIds = new Set();
    let ctrVisible = false;
    let updateQueued = false;

    const BP = {
        phoneMax: 767,
        tabletMax: 1024
    };

    function getDeviceClass() {
        const w = Math.min(window.innerWidth, screen.width || window.innerWidth);
        const h = Math.min(window.innerHeight, screen.height || window.innerHeight);
        const short = Math.min(w, h);
        const hasTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

        if (!hasTouch) return 'desktop';
        if (short <= BP.phoneMax) return 'phone';
        if (short <= BP.tabletMax) return 'tablet';
        return 'touch-laptop';
    }

    function isSmallTouchDevice() {
        const kind = getDeviceClass();
        return kind === 'phone' || kind === 'tablet';
    }

    function shouldShowControls() {
        return window.__mobileGameActive === true && isSmallTouchDevice();
    }

    function shouldRequireLandscape() {
        return window.__requireLandscapeMode === true && isSmallTouchDevice();
    }

    function pressKey(key) {
        if (heldKeys[key]) return;
        heldKeys[key] = true;
        window.dispatchEvent(new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true
        }));
    }

    function releaseKey(key) {
        if (!heldKeys[key]) return;
        heldKeys[key] = false;
        window.dispatchEvent(new KeyboardEvent('keyup', {
            key,
            bubbles: true,
            cancelable: true
        }));
    }

    function releaseAll() {
        releaseKey('ArrowLeft');
        releaseKey('ArrowRight');
        releaseKey('ArrowUp');
        releaseKey('ArrowDown');
        releaseKey(' ');
    }

    function resetStick() {
        stickEl.style.transform = 'translate(-50%, -50%)';
        releaseKey('ArrowLeft');
        releaseKey('ArrowRight');
        releaseKey('ArrowUp');
        releaseKey('ArrowDown');
        stickTouchId = null;
    }

    function resetJump() {
        jumpTouchIds.clear();
        releaseKey(' ');
        jumpWrap.classList.remove('pressed');
    }

    function setControlsVisible(on) {
        if (ctrVisible === on) return;

        ctrVisible = on;
        padWrap.classList.toggle('show', on);
        jumpWrap.classList.toggle('show', on);

        if (!on) {
            releaseAll();
            resetStick();
            resetJump();
        }
    }

    function layoutControls() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const short = Math.min(vw, vh);
        const kind = getDeviceClass();

        let padSize = 0;
        let jumpSize = 0;

        if (kind === 'phone') {
            padSize = Math.min(180, Math.max(96, short * 0.30));
            jumpSize = Math.min(140, Math.max(76, short * 0.22));
        } else if (kind === 'tablet') {
            padSize = Math.min(220, Math.max(120, short * 0.24));
            jumpSize = Math.min(170, Math.max(90, short * 0.18));
        }

        if (padSize <= 0 || jumpSize <= 0) {
            padWrap.style.display = 'none';
            jumpWrap.style.display = 'none';
            return;
        }

        padWrap.style.display = '';
        jumpWrap.style.display = '';

        const padMargin = Math.max(10, padSize * 0.08);
        const jumpMargin = Math.max(10, jumpSize * 0.10);

        padWrap.style.width = `${padSize}px`;
        padWrap.style.height = `${padSize}px`;
        padWrap.style.left = `${padMargin}px`;
        padWrap.style.bottom = `${padMargin}px`;

        jumpWrap.style.width = `${jumpSize}px`;
        jumpWrap.style.height = `${jumpSize}px`;
        jumpWrap.style.right = `${jumpMargin}px`;
        jumpWrap.style.bottom = `${jumpMargin}px`;
    }

    function checkOrientation() {
        if (!shouldRequireLandscape()) {
            overlay.classList.remove('visible');
            return;
        }

        const landscape = window.innerWidth > window.innerHeight;
        overlay.classList.toggle('visible', !landscape);

        if (!landscape) {
            releaseAll();
            resetStick();
            resetJump();
        }
    }

    function rectOf(el) {
        return el.getBoundingClientRect();
    }

    function inZone(touch, el, pad = 24) {
        const r = rectOf(el);
        return (
            touch.clientX >= r.left - pad &&
            touch.clientX <= r.right + pad &&
            touch.clientY >= r.top - pad &&
            touch.clientY <= r.bottom + pad
        );
    }

    function moveStick(cx, cy) {
        const r = rectOf(padWrap);
        const ocx = r.left + r.width / 2;
        const ocy = r.top + r.height / 2;

        let dx = cx - ocx;
        let dy = cy - ocy;

        const dist = Math.hypot(dx, dy);
        const maxR = r.width * 0.26;

        if (dist > maxR && dist > 0) {
            dx = (dx / dist) * maxR;
            dy = (dy / dist) * maxR;
        }

        stickEl.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        const thr = r.width * 0.09;

        if (dx < -thr) {
            pressKey('ArrowLeft');
            releaseKey('ArrowRight');
        } else if (dx > thr) {
            pressKey('ArrowRight');
            releaseKey('ArrowLeft');
        } else {
            releaseKey('ArrowLeft');
            releaseKey('ArrowRight');
        }

        if (dy < -thr) {
            pressKey('ArrowUp');
            releaseKey('ArrowDown');
        } else if (dy > thr) {
            pressKey('ArrowDown');
            releaseKey('ArrowUp');
        } else {
            releaseKey('ArrowUp');
            releaseKey('ArrowDown');
        }
    }

    document.addEventListener('fullscreenchange', () => {
        setTimeout(updateMobileControls, 120);
    });

    document.addEventListener('webkitfullscreenchange', () => {
        setTimeout(updateMobileControls, 120);
    });

    function updateMobileControlsNow() {
        setControlsVisible(shouldShowControls());
        layoutControls();
        checkOrientation();
    }

    function updateMobileControls() {
        if (updateQueued) return;
        updateQueued = true;

        requestAnimationFrame(() => {
            updateQueued = false;
            updateMobileControlsNow();
        });
    }

    document.addEventListener('touchstart', (e) => {
        if (!shouldShowControls()) return;

        for (const t of e.changedTouches) {
            if (stickTouchId === null && inZone(t, padWrap, 30)) {
                stickTouchId = t.identifier;
                moveStick(t.clientX, t.clientY);
            } else if (inZone(t, jumpWrap, 26)) {
                jumpTouchIds.add(t.identifier);
                pressKey(' ');
                jumpWrap.classList.add('pressed');
            }
        }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!shouldShowControls()) return;

        for (const t of e.changedTouches) {
            if (t.identifier === stickTouchId) {
                moveStick(t.clientX, t.clientY);
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        for (const t of e.changedTouches) {
            if (t.identifier === stickTouchId) {
                resetStick();
            }

            if (jumpTouchIds.has(t.identifier)) {
                jumpTouchIds.delete(t.identifier);
                if (jumpTouchIds.size === 0) {
                    releaseKey(' ');
                    jumpWrap.classList.remove('pressed');
                }
            }
        }
    }, { passive: true });

    document.addEventListener('touchcancel', () => {
        resetStick();
        resetJump();
    }, { passive: true });

    window.addEventListener('resize', updateMobileControls);

    window.addEventListener('orientationchange', () => {
        setTimeout(updateMobileControls, 200);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            releaseAll();
            resetStick();
            resetJump();
        } else {
            updateMobileControls();
        }
    });

    window.updateMobileControls = updateMobileControls;

    if (typeof window.__mobileGameActive === 'undefined') {
        window.__mobileGameActive = false;
    }

    if (typeof window.__requireLandscapeMode === 'undefined') {
        window.__requireLandscapeMode = false;
    }

    updateMobileControlsNow();
})();