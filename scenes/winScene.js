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

        this.buttons = this._buildButtons();

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouch = this._onTouch.bind(this);

        this.hovered = null;

        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchend', this._onTouch, { passive: false });
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('touchend', this._onTouch);
    }

    _buildButtons() {
        const mode = this.data?.mode || 'win';
        const size = 92;
        const gap = 28;
        const count = mode === 'win' ? 3 : 2;
        const total = size * count + gap * (count - 1);
        const x = (this.W - total) / 2;
        const y = this.H * 0.63;

        const base = [
            { id: 'home', x, y, w: size, h: size },
            { id: 'restart', x: x + size + gap, y, w: size, h: size }
        ];

        if (mode === 'win') {
            base.push({ id: 'next', x: x + (size + gap) * 2, y, w: size, h: size });
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

    _onTouch(e) {
        e.preventDefault();
        this._onClick(e);
    }

    _onClick(e) {
        const hit = this._hit(this._getPos(e));
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

    update() {}

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

        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.fillRect(0, 0, this.W, this.H);

        const panelW = Math.min(this.W * 0.42, 520);
        const panelH = Math.min(this.H * 0.5, 370);
        const panelX = (this.W - panelW) / 2;
        const panelY = (this.H - panelH) / 2 - 18;

        const msg = document.getElementById('msg_box');
        if (msg?.complete) {
            ctx.drawImage(msg, panelX, panelY, panelW, panelH);
        } else {
            ctx.fillStyle = '#2c1200';
            drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 24);
            ctx.fill();
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(panelH * 0.12)}px Arial`;
        ctx.fillText(mode === 'win' ? 'CONGRATULATIONS!' : 'GAME OVER', this.W / 2, panelY + panelH * 0.18);

        ctx.font = `bold ${Math.round(panelH * 0.09)}px Arial`;
        ctx.fillText(`SCORE: ${this.data.score || 0}`, this.W / 2, panelY + panelH * 0.48);
        ctx.fillText(`TOTAL SCORE: ${this.data.totalScore || 0}`, this.W / 2, panelY + panelH * 0.63);

        for (const b of this.buttons) {
            const hov = this.hovered === b.id;
            this._drawButton(ctx, b, hov);
        }

        ctx.textAlign = 'left';
    }

    _drawButton(ctx, b, hovered) {
        ctx.save();
        if (hovered) {
            ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
            ctx.scale(1.08, 1.08);
            ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
        }

        const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
        g.addColorStop(0, '#f7d7a3');
        g.addColorStop(1, '#e3b15e');
        ctx.fillStyle = g;
        ctx.strokeStyle = '#7d4f0e';
        ctx.lineWidth = 5;
        drawRoundedRect(ctx, b.x, b.y, b.w, b.h, 18);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#8c5b10';
        ctx.fillStyle = '#8c5b10';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (b.id === 'next') {
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.34, b.y + b.h * 0.3);
            ctx.lineTo(b.x + b.w * 0.34, b.y + b.h * 0.7);
            ctx.lineTo(b.x + b.w * 0.58, b.y + b.h * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.53, b.y + b.h * 0.3);
            ctx.lineTo(b.x + b.w * 0.53, b.y + b.h * 0.7);
            ctx.lineTo(b.x + b.w * 0.77, b.y + b.h * 0.5);
            ctx.closePath();
            ctx.fill();
        } else if (b.id === 'restart') {
            ctx.beginPath();
            ctx.arc(b.x + b.w * 0.5, b.y + b.h * 0.52, b.w * 0.2, 0.8, 5.1, true);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.38, b.y + b.h * 0.26);
            ctx.lineTo(b.x + b.w * 0.34, b.y + b.h * 0.45);
            ctx.lineTo(b.x + b.w * 0.52, b.y + b.h * 0.4);
            ctx.stroke();
        } else if (b.id === 'home') {
            ctx.beginPath();
            ctx.moveTo(b.x + b.w * 0.28, b.y + b.h * 0.52);
            ctx.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.3);
            ctx.lineTo(b.x + b.w * 0.72, b.y + b.h * 0.52);
            ctx.lineTo(b.x + b.w * 0.65, b.y + b.h * 0.52);
            ctx.lineTo(b.x + b.w * 0.65, b.y + b.h * 0.72);
            ctx.lineTo(b.x + b.w * 0.35, b.y + b.h * 0.72);
            ctx.lineTo(b.x + b.w * 0.35, b.y + b.h * 0.52);
            ctx.closePath();
            ctx.stroke();
        }

        ctx.restore();
    }
}
