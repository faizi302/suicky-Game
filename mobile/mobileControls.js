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

    function getViewportSize() {
        const vv = window.visualViewport;
        const w = Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 0);
        const h = Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 0);
        return {
            w,
            h,
            short: Math.min(w, h),
            long: Math.max(w, h)
        };
    }

    function looksLikeMobileViewport() {
        const { short, long } = getViewportSize();
        return short <= BP.tabletMax || long <= 1400;
    }

    function getDeviceClass() {
        const { short } = getViewportSize();

        if (short <= BP.phoneMax) return 'phone';
        if (short <= BP.tabletMax) return 'tablet';
        return 'desktop';
    }

    function shouldShowControls() {
        if (window.__mobileGameActive !== true) return false;

        const kind = getDeviceClass();
        if (kind === 'phone' || kind === 'tablet') return true;

        if (document.fullscreenElement && looksLikeMobileViewport()) return true;

        return false;
    }

    function isPhone() {
        return getDeviceClass() === 'phone';
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

    function setControlsVisible(on) {
        ctrVisible = on;
        padWrap.classList.toggle('show', on);
        jumpWrap.classList.toggle('show', on);

        if (on) {
            padWrap.style.display = 'block';
            jumpWrap.style.display = 'block';
            padWrap.style.visibility = 'visible';
            jumpWrap.style.visibility = 'visible';
            padWrap.style.opacity = '1';
            jumpWrap.style.opacity = '1';
        } else {
            padWrap.style.display = 'none';
            jumpWrap.style.display = 'none';
            releaseAll();
            resetStick();
            jumpTouchIds.clear();
            jumpWrap.classList.remove('pressed');
        }
    }

    function layoutControls() {
        const { short } = getViewportSize();
        const kind = getDeviceClass();

        let padSize = 0;
        let jumpSize = 0;

        if (kind === 'phone') {
            padSize = Math.min(180, Math.max(96, short * 0.30));
            jumpSize = Math.min(140, Math.max(76, short * 0.22));
        } else if (kind === 'tablet') {
            padSize = Math.min(220, Math.max(120, short * 0.24));
            jumpSize = Math.min(170, Math.max(90, short * 0.18));
        } else if (looksLikeMobileViewport()) {
            padSize = Math.min(180, Math.max(96, short * 0.30));
            jumpSize = Math.min(140, Math.max(76, short * 0.22));
        }

        if (padSize <= 0 || jumpSize <= 0) {
            padWrap.style.display = 'none';
            jumpWrap.style.display = 'none';
            return;
        }

        const padMargin = Math.max(10, padSize * 0.08);
        const jumpMargin = Math.max(10, jumpSize * 0.10);

        padWrap.style.display = ctrVisible ? 'block' : 'none';
        jumpWrap.style.display = ctrVisible ? 'block' : 'none';

        padWrap.style.position = 'fixed';
        jumpWrap.style.position = 'fixed';

        padWrap.style.width = `${padSize}px`;
        padWrap.style.height = `${padSize}px`;
        padWrap.style.left = `${padMargin}px`;
        padWrap.style.bottom = `${padMargin}px`;
        padWrap.style.zIndex = '9998';

        jumpWrap.style.width = `${jumpSize}px`;
        jumpWrap.style.height = `${jumpSize}px`;
        jumpWrap.style.right = `${jumpMargin}px`;
        jumpWrap.style.bottom = `${jumpMargin}px`;
        jumpWrap.style.zIndex = '9998';
    }

    function checkOrientation() {
        if (!window.__mobileGameActive || !isPhone()) {
            overlay.classList.remove('visible');
            return;
        }

        const { w, h } = getViewportSize();
        const landscape = w > h;
        overlay.classList.toggle('visible', !landscape);

        if (!landscape) {
            releaseAll();
            resetStick();
            jumpTouchIds.clear();
            jumpWrap.classList.remove('pressed');
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

    function updateMobileControlsNow() {
        const visible = shouldShowControls();

        setControlsVisible(visible);
        layoutControls();
        checkOrientation();

        if (visible) {
            padWrap.style.display = 'block';
            jumpWrap.style.display = 'block';
            padWrap.style.visibility = 'visible';
            jumpWrap.style.visibility = 'visible';
            padWrap.style.opacity = '1';
            jumpWrap.style.opacity = '1';
            padWrap.style.zIndex = '2147483647';
            jumpWrap.style.zIndex = '2147483647';
            padWrap.style.pointerEvents = 'auto';
            jumpWrap.style.pointerEvents = 'auto';
        }

        console.log('mobile controls visible:', visible, 'active:', window.__mobileGameActive);
    }
    function updateMobileControls() {
        if (updateQueued) return;
        updateQueued = true;

        requestAnimationFrame(() => {
            updateQueued = false;
            updateMobileControlsNow();
        });
    }

    document.addEventListener('fullscreenchange', () => {
        setTimeout(updateMobileControls, 120);
        setTimeout(updateMobileControls, 300);
        setTimeout(updateMobileControls, 600);
    });

    document.addEventListener('webkitfullscreenchange', () => {
        setTimeout(updateMobileControls, 120);
    });

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

    window.addEventListener('resize', updateMobileControls);

    window.addEventListener('orientationchange', () => {
        setTimeout(updateMobileControls, 200);
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateMobileControls);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            releaseAll();
            resetStick();
            jumpTouchIds.clear();
            jumpWrap.classList.remove('pressed');
        } else {
            updateMobileControls();
        }
    });

    window.updateMobileControls = updateMobileControls;

    updateMobileControlsNow();
})();