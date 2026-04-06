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

export default class WinScene {
    constructor(sceneManager, data = null) {
        this.sceneManager = sceneManager;
        this.canvas = sceneManager.canvas;
        this.ctx = sceneManager.ctx;
        this.W = sceneManager.width;
        this.H = sceneManager.height;

        this.data = data || {
            mode: 'win',
            score: 0,
            totalScore: 0,
            coins: 0,
            totalCoins: 0,
            keys: 0,
            totalKeys: 0,
            levelId: 1
        };

        this.hovered = null;
        this.anim = 0;
        this._lastTouchAt = 0;

        this.imgHome = document.getElementById('but_home');
        this.imgRestart = document.getElementById('but_restart');
        this.imgNext = document.getElementById('but_next') || document.getElementById('but_right');
        this.msgBox = document.getElementById('msg_box');

        this.buttons = this._buildButtons();

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouchStart = this._onTouchStart.bind(this);
        this._onTouchEnd = this._onTouchEnd.bind(this);

        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
    }

    resize(width, height) {
        this.W = width;
        this.H = height;
        this.buttons = this._buildButtons();
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
    }

    _buildButtons() {
        const mode = this.data?.mode || 'win';
        const size = Math.round(Math.min(this.W, this.H) * 0.12);
        const clamped = Math.max(64, Math.min(96, size));
        const gap = Math.round(clamped * 0.28);
        const count = mode === 'win' ? 3 : 2;
        const total = clamped * count + gap * (count - 1);
        const x = (this.W - total) / 2;
        const y = this.H * 0.64;

        const base = [
            { id: 'home', x, y, w: clamped, h: clamped, img: this.imgHome },
            { id: 'restart', x: x + clamped + gap, y, w: clamped, h: clamped, img: this.imgRestart }
        ];

        if (mode === 'win') {
            base.push({
                id: 'next',
                x: x + (clamped + gap) * 2,
                y,
                w: clamped,
                h: clamped,
                img: this.imgNext
            });
        }

        return base;
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

    _hit(pos) {
        return this.buttons.find(b =>
            pos.x >= b.x && pos.x <= b.x + b.w &&
            pos.y >= b.y && pos.y <= b.y + b.h
        ) || null;
    }

    _onMouseMove(e) {
        this.hovered = this._hit(this._getPos(e))?.id || null;
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
        const hit = this._hit(pos);
        if (!hit) return;

        if (hit.id === 'home') {
            this.sceneManager.setScene('menu');
            return;
        }

        if (hit.id === 'restart') {
            this.sceneManager.startLevel(this.data?.levelId || 1);
            return;
        }

        if (hit.id === 'next') {
            this.sceneManager.startLevel((this.data?.levelId || 1) + 1);
        }
    }

    update(dt = 16) {
        this.anim = Math.min(1, this.anim + dt / 220);
    }

    draw() {
        const ctx = this.ctx;
        const mode = this.data?.mode || 'win';

        const bg = document.getElementById('bg');
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
            ctx.fillStyle = '#1d0f05';
            ctx.fillRect(0, 0, this.W, this.H);
        }

        ctx.save();
        ctx.globalAlpha = this.anim;
        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.fillRect(0, 0, this.W, this.H);

        const panelW = Math.min(this.W * 0.46, 600);
        const panelH = Math.min(this.H * 0.52, 390);
        const panelX = (this.W - panelW) / 2;
        const panelY = (this.H - panelH) / 2 - 18;

        ctx.translate(this.W / 2, this.H / 2);
        const scale = 0.88 + this.anim * 0.12;
        ctx.scale(scale, scale);
        ctx.translate(-this.W / 2, -this.H / 2);

        if (this.msgBox?.complete) {
            ctx.drawImage(this.msgBox, panelX, panelY, panelW, panelH);
        } else {
            ctx.fillStyle = '#2c1200';
            drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 24);
            ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(panelH * 0.12)}px Arial Black, Arial`;
        ctx.fillText(mode === 'win' ? 'CONGRATULATIONS!' : 'GAME OVER', this.W / 2, panelY + panelH * 0.18);

        ctx.font = `bold ${Math.round(panelH * 0.10)}px Arial Black, Arial`;
        ctx.fillText(`SCORE: ${this.data.score || 0}`, this.W / 2, panelY + panelH * 0.46);
        ctx.fillText(`TOTAL SCORE: ${this.data.totalScore || 0}`, this.W / 2, panelY + panelH * 0.64);

        for (const b of this.buttons) {
            const hov = this.hovered === b.id;
            this._drawButton(ctx, b, hov);
        }

        ctx.restore();
    }

    _drawButton(ctx, b, hovered) {
        ctx.save();

        const scale = hovered ? 1.06 : 1;
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));

        if (b.img?.complete && b.img.naturalWidth > 0) {
            ctx.drawImage(b.img, b.x, b.y, b.w, b.h);
        } else {
            const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
            g.addColorStop(0, '#f7d7a3');
            g.addColorStop(1, '#e3b15e');
            ctx.fillStyle = g;
            ctx.strokeStyle = '#7d4f0e';
            ctx.lineWidth = 5;
            drawRoundedRect(ctx, b.x, b.y, b.w, b.h, 18);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#8c5b10';
            ctx.font = `bold ${Math.round(b.h * 0.42)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
                b.id === 'home' ? '⌂' : b.id === 'restart' ? '↺' : '▶',
                b.x + b.w / 2,
                b.y + b.h / 2
            );
        }

        ctx.restore();
    }
}