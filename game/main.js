import SceneManager from './SceneManager.js';
import { initSoundSystem } from '../system/soundSystem.js';

// Fixed gameplay height, dynamic width
const VIRT_H = 720;
let VIRT_W = 1280;

const MIN_VIRT_W = 960;
const MAX_VIRT_W = 1920;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', {
    alpha: false
});

let sceneManager = null;

function updateVirtualSize() {
    const screenW = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1280);
    const screenH = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 720);

    VIRT_W = Math.floor(screenW * (VIRT_H / screenH));
    VIRT_W = Math.max(MIN_VIRT_W, Math.min(VIRT_W, MAX_VIRT_W));
}

let lastCssW = 0;
let lastCssH = 0;
let lastBufferW = 0;
let lastBufferH = 0;

function fitCanvas() {
    updateVirtualSize();

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const windowW = Math.max(1, window.innerWidth || document.documentElement.clientWidth || VIRT_W);
    const windowH = Math.max(1, window.innerHeight || document.documentElement.clientHeight || VIRT_H);

    const scale = Math.min(windowW / VIRT_W, windowH / VIRT_H);
    const displayW = Math.max(1, Math.floor(VIRT_W * scale));
    const displayH = Math.max(1, Math.floor(VIRT_H * scale));

    const bufferW = Math.round(VIRT_W * dpr);
    const bufferH = Math.round(VIRT_H * dpr);

    if (bufferW !== lastBufferW) canvas.width = bufferW;
    if (bufferH !== lastBufferH) canvas.height = bufferH;

    if (displayW !== lastCssW) canvas.style.width = `${displayW}px`;
    if (displayH !== lastCssH) canvas.style.height = `${displayH}px`;

    canvas.style.position = 'absolute';
    canvas.style.left = `${Math.floor((windowW - displayW) / 2)}px`;
    canvas.style.top = `${Math.floor((windowH - displayH) / 2)}px`;
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.touchAction = 'none';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    lastCssW = displayW;
    lastCssH = displayH;
    lastBufferW = bufferW;
    lastBufferH = bufferH;

    if (sceneManager) sceneManager.resize(VIRT_W, VIRT_H);
}

let resizeQueued = false;

function queueResize() {
    if (resizeQueued) return;
    resizeQueued = true;

    requestAnimationFrame(() => {
        resizeQueued = false;
        fitCanvas();
    });
}

fitCanvas();

window.addEventListener('resize', queueResize);
window.addEventListener('orientationchange', () => setTimeout(queueResize, 200));
document.addEventListener('fullscreenchange', () => setTimeout(queueResize, 100));

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', queueResize);
}

initSoundSystem();

sceneManager = new SceneManager(canvas, ctx, VIRT_W, VIRT_H);
sceneManager.resize(VIRT_W, VIRT_H);

let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60;
const MAX_FRAME_DT = 100;
const MAX_STEPS = 6;

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    let frameDt = timestamp - lastTime;
    lastTime = timestamp;

    if (frameDt < 0) frameDt = 0;
    if (frameDt > MAX_FRAME_DT) frameDt = MAX_FRAME_DT;

    accumulator += frameDt;

    let steps = 0;
    while (accumulator >= FIXED_STEP && steps < MAX_STEPS) {
        sceneManager.update(FIXED_STEP);
        accumulator -= FIXED_STEP;
        steps++;
    }

    if (steps === MAX_STEPS && accumulator > FIXED_STEP) {
        accumulator = 0;
    }

    ctx.clearRect(0, 0, VIRT_W, VIRT_H);
    sceneManager.draw();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

