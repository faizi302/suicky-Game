(function () {
    'use strict';

    const padWrap  = document.getElementById('mobile-pad-wrap');
    const jumpWrap = document.getElementById('mobile-jump-wrap');
    const stickEl  = document.getElementById('pad-stick-el');
    const overlay  = document.getElementById('rotate-overlay');

    if (!padWrap || !jumpWrap || !stickEl || !overlay) return;

    const heldKeys = {};
    let stickTouchId = null;
    let jumpTouchIds = new Set();
    let ctrVisible = false;

    const BP = {
        phoneMax: 767,
        tabletMax: 1024,
        laptopMin: 1025
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

    function shouldShowControls() {
        const kind = getDeviceClass();
        return window.__mobileGameActive === true && (kind === 'phone' || kind === 'tablet');
    }

    function isPhone() {
        return getDeviceClass() === 'phone';
    }

    function pressKey(k) {
        if (heldKeys[k]) return;
        heldKeys[k] = true;
        window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
    }

    function releaseKey(k) {
        if (!heldKeys[k]) return;
        heldKeys[k] = false;
        window.dispatchEvent(new KeyboardEvent('keyup', { key: k, bubbles: true, cancelable: true }));
    }

    function releaseAll() {
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].forEach(releaseKey);
    }

    function resetStick() {
        stickEl.style.transform = 'translate(-50%, -50%)';
        releaseKey('ArrowLeft');
        releaseKey('ArrowRight');
        releaseKey('ArrowUp');
        releaseKey('ArrowDown');
        stickTouchId = null;
    }

    function setControlsVisible(on) {
        if (ctrVisible === on) return;
        ctrVisible = on;
        padWrap.classList.toggle('show', on);
        jumpWrap.classList.toggle('show', on);
        if (!on) {
            releaseAll();
            resetStick();
        }
    }

    function layoutControls() {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const short = Math.min(vw, vh);
        const kind = getDeviceClass();

        let padSize;
        let jumpSize;

        if (kind === 'phone') {
            padSize = Math.min(180, Math.max(96, short * 0.30));
            jumpSize = Math.min(140, Math.max(76, short * 0.22));
        } else if (kind === 'tablet') {
            padSize = Math.min(220, Math.max(120, short * 0.24));
            jumpSize = Math.min(170, Math.max(90, short * 0.18));
        } else {
            padSize = 0;
            jumpSize = 0;
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
        if (!window.__mobileGameActive || !isPhone()) {
            overlay.classList.remove('visible');
            return;
        }
        const landscape = window.innerWidth > window.innerHeight;
        overlay.classList.toggle('visible', !landscape);
        if (!landscape) releaseAll();
    }

    function rectOf(el) {
        return el.getBoundingClientRect();
    }

    function inZone(touch, el, pad = 24) {
        const r = rectOf(el);
        return touch.clientX >= r.left - pad && touch.clientX <= r.right + pad &&
               touch.clientY >= r.top - pad && touch.clientY <= r.bottom + pad;
    }

    function moveStick(cx, cy) {
        const r = rectOf(padWrap);
        const ocx = r.left + r.width / 2;
        const ocy = r.top + r.height / 2;

        let dx = cx - ocx;
        let dy = cy - ocy;

        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = r.width * 0.26;

        if (dist > maxR) {
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
        jumpTouchIds.clear();
        releaseKey(' ');
        jumpWrap.classList.remove('pressed');
    }, { passive: true });

    setInterval(() => {
        setControlsVisible(shouldShowControls());
        layoutControls();
        checkOrientation();
    }, 250);

    window.addEventListener('resize', () => {
        layoutControls();
        checkOrientation();
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            layoutControls();
            checkOrientation();
        }, 200);
    });

    layoutControls();
    checkOrientation();
})();