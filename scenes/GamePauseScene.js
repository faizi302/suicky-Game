import { playUiClick, setMusicVolume } from '../system/soundSystem.js';

export default class GamePauseScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.canvas = sceneManager.canvas;
        this.ctx = sceneManager.ctx;
        this.W = sceneManager.width;
        this.H = sceneManager.height;

        this.buttons = this._buildButtons();
        this.hoveredBtn = null;

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onKeyDown = this._onKeyDown.bind(this);
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        window.addEventListener('keydown', this._onKeyDown);

        setMusicVolume(0.12);
    }

    _buildButtons() {
        const W = this.W;
        const H = this.H;
        const bw = 230;
        const bh = 56;
        const gap = 16;
        const startY = H / 2 - 10;
        const cx = W / 2 - bw / 2;
        return [
            { id: 'resume', label: '▶  RESUME', color: '#4cae4c', x: cx, y: startY, w: bw, h: bh },
            { id: 'restart', label: '↺  RESTART', color: '#e6a817', x: cx, y: startY + bh + gap, w: bw, h: bh },
            { id: 'home', label: '⌂  MAIN MENU', color: '#c9302c', x: cx, y: startY + (bh + gap) * 2, w: bw, h: bh }
        ];
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
        window.removeEventListener('keydown', this._onKeyDown);
        setMusicVolume(0.35);
    }

    _getPos(e) {
        const r = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (this.W / r.width),
            y: (e.clientY - r.top) * (this.H / r.height)
        };
    }

    _onKeyDown(e) {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            this.sceneManager.setScene('gameplay');
            e.preventDefault();
        }
    }

    _onMouseMove(e) {
        const { x, y } = this._getPos(e);
        this.hoveredBtn = null;
        for (const b of this.buttons) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this.hoveredBtn = b.id;
                break;
            }
        }
    }

    _onClick(e) {
        const { x, y } = this._getPos(e);
        for (const b of this.buttons) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                this._handleBtn(b.id);
                return;
            }
        }
    }

    _handleBtn(id) {
        playUiClick(1);
        switch (id) {
            case 'resume':
                this.sceneManager.setScene('gameplay');
                break;
            case 'restart':
                if (this.sceneManager.gamePlayScene) {
                    this.sceneManager.gamePlayScene.internalReset();
                }
                this.sceneManager.setScene('gameplay');
                break;
            case 'home':
                this.sceneManager.setScene('menu');
                break;
        }
    }

    update() {}

    draw() {
        const ctx = this.ctx;
        const W = this.W;
        const H = this.H;

        ctx.fillStyle = 'rgba(0,0,0,0.62)';
        ctx.fillRect(0, 0, W, H);

        const pw = 340;
        const ph = 360;
        const px = W / 2 - pw / 2;
        const py = H / 2 - ph / 2 - 28;

        ctx.save();
        ctx.shadowColor = 'rgba(200,135,42,0.5)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = 'rgba(30,12,3,0.94)';
        ctx.strokeStyle = '#c8872a';
        ctx.lineWidth = 5;
        this._rr(ctx, px, py, pw, ph, 20);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffe040';
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#ffe040';
        ctx.font = 'bold 50px "Arial Black", Arial';
        ctx.fillText('⏸  PAUSED', W / 2, py + 68);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(200,200,200,0.8)';
        ctx.font = '16px Arial';
        ctx.fillText('Press  ESC  or  P  to resume', W / 2, py + 108);
        ctx.restore();

        for (const b of this.buttons) {
            this._drawBtn(ctx, b, this.hoveredBtn === b.id);
        }
    }

    _drawBtn(ctx, b, hov) {
        ctx.save();
        if (hov) {
            ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
            ctx.scale(1.06, 1.06);
            ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2));
        }

        ctx.fillStyle = hov ? b.color : `${b.color}bb`;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2.5;
        this._rr(ctx, b.x, b.y, b.w, b.h, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (hov) {
            ctx.shadowColor = 'rgba(255,255,255,0.4)';
            ctx.shadowBlur = 8;
        }
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
        ctx.restore();
    }

    _rr(ctx, x, y, w, h, r = 12) {
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
}
