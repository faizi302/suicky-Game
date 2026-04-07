import { getLevelProgress, getTotalLatestScore, getUnlockedLevelsCount } from '../system/progress.js';

function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export default class LevelScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.canvas = sceneManager.canvas;
        this.ctx = sceneManager.ctx;
        this.W = sceneManager.width;
        this.H = sceneManager.height;

        this.hoveredId = null;
        this.panelScale = Math.min(this.W / 1366, this.H / 768);
        this.topButtons = this._buildTopButtons();
        this.levelButtons = this._buildLevelButtons();
        this._lastTouchAt = 0;

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });

        window.__mobileGameActive = false;
        if (window.updateMobileControls) window.updateMobileControls();
    }

    resize(width, height) {
        this.W = width;
        this.H = height;
        this.panelScale = Math.min(this.W / 1280, this.H / 768);
        this.topButtons = this._buildTopButtons();
        this.levelButtons = this._buildLevelButtons();
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }

    _buildTopButtons() {
        const size = Math.round(Math.min(this.W, this.H) * 0.09);
        const pad = Math.round(size * 0.28);
        const gap = Math.round(size * 0.16);

        return [
            { id: 'fullscreen', x: pad, y: pad, w: size, h: size },
            { id: 'audio', x: this.W - pad - size * 2 - gap, y: pad, w: size, h: size },
            { id: 'close', x: this.W - pad - size, y: pad, w: size, h: size }
        ];
    }

    _panelRect() {
        const panelW = Math.min(this.W * 0.53, 760);
        const panelH = Math.min(this.H * 0.74, 760);
        return {
            x: Math.round((this.W - panelW) / 2),
            y: Math.round((this.H - panelH) / 2) + 8,
            w: Math.round(panelW),
            h: Math.round(panelH)
        };
    }

    _buildLevelButtons() {
        const panel = this._panelRect();
        const cols = 4;
        const rows = 3;

        const innerPadX = Math.round(panel.w * 0.08);
        const topPad = Math.round(panel.h * 0.11);
        const footerSpace = Math.round(panel.h * 0.20); // reserved area for total score
        const gapX = Math.round(panel.w * 0.045);
        const gapY = Math.round(panel.h * 0.045);

        const availableW = panel.w - innerPadX * 2;
        const availableH = panel.h - topPad - footerSpace;

        const btnAspect = 120 / 130; // source button ratio
        const btnWByWidth = (availableW - gapX * (cols - 1)) / cols;
        const btnHByWidth = btnWByWidth / btnAspect;

        const btnHByHeight = (availableH - gapY * (rows - 1)) / rows;
        const btnWByHeight = btnHByHeight * btnAspect;

        const btnW = Math.round(Math.min(btnWByWidth, btnWByHeight));
        const btnH = Math.round(btnW / btnAspect);

        const gridW = cols * btnW + (cols - 1) * gapX;
        const gridH = rows * btnH + (rows - 1) * gapY;

        const startX = Math.round(panel.x + (panel.w - gridW) / 2);
        const startY = Math.round(panel.y + topPad + Math.max(0, (availableH - gridH) * 0.18));

        const buttons = [];
        let levelId = 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                buttons.push({
                    id: levelId,
                    x: Math.round(startX + c * (btnW + gapX)),
                    y: Math.round(startY + r * (btnH + gapY)),
                    w: btnW,
                    h: btnH
                });
                levelId++;
            }
        }

        return buttons;
    }

    _getPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.W / rect.width;
        const scaleY = this.H / rect.height;
        const src = (e.changedTouches && e.changedTouches[0]) || e;

        return {
            x: (src.clientX - rect.left) * scaleX,
            y: (src.clientY - rect.top) * scaleY
        };
    }

    _hit(items, pos) {
        return items.find(item =>
            pos.x >= item.x && pos.x <= item.x + item.w &&
            pos.y >= item.y && pos.y <= item.y + item.h
        ) || null;
    }

    _onMouseMove(e) {
        const pos = this._getPos(e);
        const topHit = this._hit(this.topButtons, pos);
        const levelHit = this._hit(this.levelButtons, pos);
        this.hoveredId = topHit?.id || levelHit?.id || null;
    }

    _onTouchStart(e) {
        e.preventDefault();
    }

    _onTouchEnd(e) {
        this._lastTouchAt = performance.now();
        e.preventDefault();
        this._handlePress(this._getPos(e));
    }

    _onClick(e) {
        if (performance.now() - this._lastTouchAt < 450) return;
        this._handlePress(this._getPos(e));
    }

    _handlePress(pos) {
        const topHit = this._hit(this.topButtons, pos);
        if (topHit) {
            this._handleTopButton(topHit.id);
            return;
        }

        const levelHit = this._hit(this.levelButtons, pos);
        if (!levelHit) return;

        if (levelHit.id <= getUnlockedLevelsCount()) {
            this.sceneManager.startLevel(levelHit.id);
        }
    }

    _handleTopButton(id) {
        if (id === 'fullscreen') {
            this.sceneManager.toggleFullscreen();
            return;
        }
        if (id === 'audio') {
            this.sceneManager.toggleAudio();
            return;
        }
        if (id === 'close') {
            this.sceneManager.setScene('menu');
        }
    }

    update() {}

    draw() {
        const ctx = this.ctx;
        ctx.save();
        this._drawBackground(ctx);
        this._drawTopButtons(ctx);
        this._drawPanel(ctx);
        ctx.restore();
    }

    _drawBackground(ctx) {
        const bg = document.getElementById('img_bg_levelselect') || document.getElementById('bg');
        if (bg?.complete) {
            const s = Math.max(this.W / bg.naturalWidth, this.H / bg.naturalHeight);
            ctx.drawImage(
                bg,
                Math.round((this.W - bg.naturalWidth * s) / 2),
                Math.round((this.H - bg.naturalHeight * s) / 2),
                Math.round(bg.naturalWidth * s),
                Math.round(bg.naturalHeight * s)
            );
        } else {
            ctx.fillStyle = '#2a180c';
            ctx.fillRect(0, 0, this.W, this.H);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 0, this.W, this.H);
    }

    _drawTopButtons(ctx) {
        for (const btn of this.topButtons) {
            const hovered = this.hoveredId === btn.id;
            this._drawTopButtonImage(ctx, btn, hovered ? 1.06 : 1);
        }
    }

    _drawPanel(ctx) {
        const panel = this._panelRect();
        const panelImg = document.getElementById('img_level_panel') || document.getElementById('msg_box');

        if (panelImg?.complete) {
            ctx.drawImage(panelImg, panel.x, panel.y, panel.w, panel.h);
        } else {
            ctx.fillStyle = '#2a1408';
            drawRoundedRect(ctx, panel.x, panel.y, panel.w, panel.h, 24);
            ctx.fill();
        }

        for (const btn of this.levelButtons) {
            this._drawLevelButton(ctx, btn);
        }

        const lastBtn = this.levelButtons[this.levelButtons.length - 1];
        const footerTop = lastBtn ? (lastBtn.y + lastBtn.h) : (panel.y + panel.h * 0.75);
        const footerBottom = panel.y + panel.h - Math.round(panel.h * 0.05);
        const scoreY = Math.round(footerTop + (footerBottom - footerTop) * 0.62);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(70, 35, 0, 0.9)';
        ctx.lineWidth = Math.max(2, Math.round(panel.h * 0.008));
        ctx.font = `bold ${Math.round(Math.min(panel.h * 0.062, 26))}px Arial`;
        const txt = `TOTAL SCORE: ${getTotalLatestScore()}`;
        ctx.strokeText(txt, panel.x + panel.w / 2, scoreY);
        ctx.fillText(txt, panel.x + panel.w / 2, scoreY);
        ctx.restore();
    }

    _drawLevelButton(ctx, btn) {
        const img = document.getElementById('img_but_level');
        const frameW = img?.complete ? Math.floor(img.naturalWidth / 2) : 120;
        const frameH = img?.complete ? img.naturalHeight : 130;
        const unlocked = btn.id <= getUnlockedLevelsCount();
        const hovered = this.hoveredId === btn.id;
        const progress = getLevelProgress(btn.id);
        const score = Number(progress?.latestScore || progress?.score || 0);

        ctx.save();

        if (hovered) {
            ctx.translate(btn.x + btn.w / 2, btn.y + btn.h / 2);
            ctx.scale(1.035, 1.035);
            ctx.translate(-(btn.x + btn.w / 2), -(btn.y + btn.h / 2));
        }

        if (img?.complete) {
            const sx = unlocked ? 0 : frameW;
            ctx.drawImage(img, sx, 0, frameW, frameH, btn.x, btn.y, btn.w, btn.h);
        } else {
            ctx.fillStyle = unlocked ? '#efb66b' : '#8b7454';
            drawRoundedRect(ctx, btn.x, btn.y, btn.w, btn.h, 14);
            ctx.fill();
        }

        const numberY = btn.y + btn.h * 0.34;
        const scoreY = btn.y + btn.h * 0.77;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = unlocked ? '#8e5a05' : '#ffffff';
        ctx.font = `bold ${Math.round(btn.h * 0.34)}px Arial`;
        ctx.fillText(String(btn.id), btn.x + btn.w / 2, numberY);

        if (unlocked) {
            ctx.font = `bold ${Math.round(btn.h * 0.18)}px Arial`;
            ctx.fillText(String(score), btn.x + btn.w / 2, scoreY);
        } else {
            const lockImg = document.getElementById('img_lock');
            const lockW = btn.w * 0.22;
            const lockH = btn.h * 0.28;

            if (lockImg?.complete) {
                ctx.drawImage(
                    lockImg,
                    btn.x + (btn.w - lockW) / 2,
                    btn.y + btn.h * 0.60,
                    lockW,
                    lockH
                );
            } else {
                ctx.font = `bold ${Math.round(btn.h * 0.26)}px Arial`;
                ctx.fillStyle = '#ffd94f';
                ctx.fillText('🔒', btn.x + btn.w / 2, btn.y + btn.h * 0.76);
            }
        }

        ctx.restore();
    }

    _drawTopButtonImage(ctx, btn, scale = 1) {
        const img = this._getTopButtonImage(btn.id);
        if (!img) return;

        const hovered = this.hoveredId === btn.id;
        const drawScale = hovered ? scale : 1;

        ctx.save();

        if (drawScale !== 1) {
            ctx.translate(btn.x + btn.w / 2, btn.y + btn.h / 2);
            ctx.scale(drawScale, drawScale);
            ctx.translate(-(btn.x + btn.w / 2), -(btn.y + btn.h / 2));
        }

        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        if (btn.id === 'audio') {
            const muted = this.sceneManager.isAudioMuted();
            const frames = this._getSpriteFrameData(img, 2);
            const sx = muted ? frames.frameW : 0;
            ctx.drawImage(img, sx, 0, frames.frameW, frames.frameH, btn.x, btn.y, btn.w, btn.h);
        } else if (btn.id === 'fullscreen') {
            const isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );
            const frames = this._getSpriteFrameData(img, 2);
            const sx = isFullscreen ? frames.frameW : 0;
            ctx.drawImage(img, sx, 0, frames.frameW, frames.frameH, btn.x, btn.y, btn.w, btn.h);
        } else {
            ctx.drawImage(img, btn.x, btn.y, btn.w, btn.h);
        }

        ctx.restore();
    }

    _getSpriteFrameData(img, framesCount) {
        return {
            frameW: Math.floor(img.naturalWidth / framesCount),
            frameH: img.naturalHeight
        };
    }

    _getTopButtonImage(id) {
        if (id === 'fullscreen') return document.getElementById('img_but_fullscreen');
        if (id === 'audio') return document.getElementById('img_but_audio');
        if (id === 'close') return document.getElementById('but_exit');
        return null;
    }
}