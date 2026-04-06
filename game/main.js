import SceneManager from './SceneManager.js';
import { initSoundSystem } from '../system/soundSystem.js';

// Fixed gameplay height, dynamic width
const VIRT_H = 720;
let VIRT_W = 1280;

const MIN_VIRT_W = 960;
const MAX_VIRT_W = 1920;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d', {
    alpha: false,
    desynchronized: true
});

let sceneManager = null;

function updateVirtualSize() {
    const screenW = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1280);
    const screenH = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 720);

    // Keep virtual height fixed, adapt width to current screen ratio
    VIRT_W = Math.floor(screenW * (VIRT_H / screenH));

    // Clamp so it does not become too narrow or too wide
    VIRT_W = Math.max(MIN_VIRT_W, Math.min(VIRT_W, MAX_VIRT_W));
}

function fitCanvas() {
    updateVirtualSize();

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const windowW = Math.max(1, window.innerWidth || document.documentElement.clientWidth || VIRT_W);
    const windowH = Math.max(1, window.innerHeight || document.documentElement.clientHeight || VIRT_H);

    // Keep whole game visible
    const scale = Math.min(windowW / VIRT_W, windowH / VIRT_H);

    const displayW = Math.max(1, Math.floor(VIRT_W * scale));
    const displayH = Math.max(1, Math.floor(VIRT_H * scale));

    canvas.width = Math.round(VIRT_W * dpr);
    canvas.height = Math.round(VIRT_H * dpr);

    canvas.style.position = 'absolute';
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    canvas.style.left = `${Math.floor((windowW - displayW) / 2)}px`;
    canvas.style.top = `${Math.floor((windowH - displayH) / 2)}px`;
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    canvas.style.imageRendering = 'pixelated';
    canvas.style.imageRendering = 'crisp-edges';
    canvas.style.touchAction = 'none';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    if (sceneManager) {
        sceneManager.resize(VIRT_W, VIRT_H);
    }
}

function handleResize() {
    fitCanvas();
}

fitCanvas();

window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 120);
});
document.addEventListener('fullscreenchange', () => {
    setTimeout(handleResize, 80);
});
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}

initSoundSystem();

sceneManager = new SceneManager(canvas, ctx, VIRT_W, VIRT_H);
sceneManager.resize(VIRT_W, VIRT_H);

let lastTime = 0;
let accumulator = 0;
const FIXED_STEP = 1000 / 60;

function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;

    let frameDt = timestamp - lastTime;
    lastTime = timestamp;

    frameDt = Math.max(0, Math.min(frameDt, 40));
    accumulator += frameDt;

    while (accumulator >= FIXED_STEP) {
        sceneManager.update(FIXED_STEP);
        accumulator -= FIXED_STEP;
    }

    ctx.clearRect(0, 0, VIRT_W, VIRT_H);
    sceneManager.draw();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);