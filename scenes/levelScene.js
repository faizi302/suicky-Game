import { getLevelProgress, getTotalLatestScore, getUnlockedLevelsCount, TOTAL_LEVELS } from '../system/progress.js';

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

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
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
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }

    _buildTopButtons() {
        const size = Math.round(Math.min(this.W, this.H) * 0.09);
        const pad = Math.round(size * 0.28);
        return [
            { id: 'fullscreen', x: pad, y: pad, w: size, h: size },
            { id: 'audio', x: this.W - pad - size * 2 - 16, y: pad, w: size, h: size },
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
        const btnW = Math.round(panel.w * 0.155);
        const btnH = Math.round(btnW * (130 / 120));
        const gapX = Math.round(panel.w * 0.055);
        const gapY = Math.round(panel.h * 0.06);
        const startX = Math.round(panel.x + (panel.w - (cols * btnW + (cols - 1) * gapX)) / 2);
        const startY = Math.round(panel.y + panel.h * 0.12);

        const buttons = [];
        let levelId = 1;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                buttons.push({
                    id: levelId,
                    x: startX + c * (btnW + gapX),
                    y: startY + r * (btnH + gapY),
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
        return items.find(item => (
            pos.x >= item.x && pos.x <= item.x + item.w &&
            pos.y >= item.y && pos.y <= item.y + item.h
        )) || null;
    }

    _onMouseMove(e) {
        const pos = this._getPos(e);
        const topHit = this._hit(this.topButtons, pos);
        const levelHit = this._hit(this.levelButtons, pos);
        this.hoveredId = topHit?.id || levelHit?.id || null;
    }

    _onTouchEnd(e) {
        e.preventDefault();
        this._onClick(e);
    }

    _onClick(e) {
        const pos = this._getPos(e);
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
            this._drawWoodButton(ctx, btn.x, btn.y, btn.w, btn.h, hovered ? 1.06 : 1, btn.id);
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

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(panel.h * 0.082)}px Arial`;
        ctx.fillText(`TOTAL SCORE: ${getTotalLatestScore()}`, panel.x + panel.w / 2, panel.y + panel.h - 50);
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
            ctx.scale(1.04, 1.04);
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
        const scoreY = btn.y + btn.h * 0.76;

        ctx.textAlign = 'center';
        ctx.fillStyle = unlocked ? '#8e5a05' : '#ffffff';
        ctx.font = `bold ${Math.round(btn.h * 0.36)}px Arial`;
        ctx.fillText(String(btn.id), btn.x + btn.w / 2, numberY);

        if (unlocked) {
            ctx.font = `bold ${Math.round(btn.h * 0.21)}px Arial`;
            ctx.fillText(String(score), btn.x + btn.w / 2, scoreY);
        } else {
            ctx.font = `bold ${Math.round(btn.h * 0.28)}px Arial`;
            ctx.fillStyle = '#ffd94f';
            ctx.fillText('🔒', btn.x + btn.w / 2, btn.y + btn.h * 0.78);
        }

        ctx.restore();
    }

    _drawWoodButton(ctx, x, y, w, h, scale, kind) {
        ctx.save();
        if (scale !== 1) {
            ctx.translate(x + w / 2, y + h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(x + w / 2), -(y + h / 2));
        }

        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#f3d6a8');
        g.addColorStop(1, '#e4b059');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#7f4f06';
        ctx.lineWidth = Math.max(3, Math.round(w * 0.06));
        drawRoundedRect(ctx, x, y, w, h, Math.round(w * 0.18));
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#8c5b10';
        ctx.fillStyle = '#8c5b10';
        ctx.lineWidth = Math.max(4, Math.round(w * 0.07));
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (kind === 'close') {
            ctx.beginPath();
            ctx.moveTo(x + w * 0.3, y + h * 0.3);
            ctx.lineTo(x + w * 0.7, y + h * 0.7);
            ctx.moveTo(x + w * 0.7, y + h * 0.3);
            ctx.lineTo(x + w * 0.3, y + h * 0.7);
            ctx.stroke();
        } else if (kind === 'audio') {
            const muted = this.sceneManager.isAudioMuted();
            ctx.beginPath();
            ctx.moveTo(x + w * 0.28, y + h * 0.58);
            ctx.lineTo(x + w * 0.42, y + h * 0.58);
            ctx.lineTo(x + w * 0.54, y + h * 0.72);
            ctx.lineTo(x + w * 0.54, y + h * 0.28);
            ctx.lineTo(x + w * 0.42, y + h * 0.42);
            ctx.lineTo(x + w * 0.28, y + h * 0.42);
            ctx.closePath();
            ctx.stroke();
            if (!muted) {
                ctx.beginPath();
                ctx.arc(x + w * 0.56, y + h * 0.5, w * 0.16, -0.8, 0.8);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x + w * 0.58, y + h * 0.5, w * 0.24, -0.8, 0.8);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(x + w * 0.25, y + h * 0.25);
                ctx.lineTo(x + w * 0.75, y + h * 0.75);
                ctx.strokeStyle = '#c53f2c';
                ctx.lineWidth = Math.max(5, Math.round(w * 0.09));
                ctx.stroke();
            }
        } else if (kind === 'fullscreen') {
            const s = 0.18;
            ctx.beginPath();
            ctx.moveTo(x + w * 0.42, y + h * 0.42);
            ctx.lineTo(x + w * 0.24, y + h * 0.24);
            ctx.lineTo(x + w * 0.38, y + h * 0.24);
            ctx.moveTo(x + w * 0.58, y + h * 0.42);
            ctx.lineTo(x + w * 0.76, y + h * 0.24);
            ctx.lineTo(x + w * 0.62, y + h * 0.24);
            ctx.moveTo(x + w * 0.42, y + h * 0.58);
            ctx.lineTo(x + w * 0.24, y + h * 0.76);
            ctx.lineTo(x + w * 0.38, y + h * 0.76);
            ctx.moveTo(x + w * 0.58, y + h * 0.58);
            ctx.lineTo(x + w * 0.76, y + h * 0.76);
            ctx.lineTo(x + w * 0.62, y + h * 0.76);
            ctx.stroke();
        }

        ctx.restore();
    }
}
