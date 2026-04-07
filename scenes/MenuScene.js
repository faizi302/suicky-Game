import { playUiClick } from '../system/soundSystem.js';

export default class MenuScene {
    constructor(game) {
        this.game = game;
        this.canvas = game.canvas;
        this.ctx = game.ctx;
        this.W = game.width;
        this.H = game.height;

        this.SS_COLS = 15;
        this.FRAME_W = 230;
        this.FRAME_H = 185;

        this.loading = true;
        this.loadProgress = 0;
        this._loadStart = performance.now();

        this.TILE_H = Math.round(this.H * 0.095);
        this.TILE_W = Math.round(this.TILE_H * 1.35);
        this.floorY = Math.round(this.H * 0.56);

        const charH = Math.round(this.H * 0.205);
        const charW = Math.round(charH * (this.FRAME_W / this.FRAME_H));

        this.chars = [
            { row: 2, x: this.W * 0.085 - charW * 0.5, w: charW, h: charH, frame: 0, frameT: 0, interval: 48 },
            { row: 0, x: this.W * 0.285 - charW * 0.5, w: charW, h: charH, frame: 4, frameT: 0, interval: 48 },
            { row: 3, x: this.W * 0.485 - charW * 0.5, w: charW, h: charH, frame: 9, frameT: 0, interval: 48 },
            { row: 1, x: this.W * 0.685 - charW * 0.5, w: charW, h: charH, frame: 2, frameT: 0, interval: 48 }
        ];

        this.groupDir = 1;
        this.groupSpeed = 3.9;
        this.reverseTimer = 0;

        this.titleY = -380;
        this.titleVY = 0;
        this.titleBounces = 0;
        this.titleLanded = false;
        this.targetTitleY = this.floorY - Math.round(this.H * 0.098);

        this.langFrame = 0;
        this.muted = this.game.isAudioMuted ? this.game.isAudioMuted() : false;
        this.isFS = !!document.fullscreenElement;
        this._fsListener = () => this.isFS = !!document.fullscreenElement;
        document.addEventListener('fullscreenchange', this._fsListener);

        this.hoveredBtn = null;
        this.buttons = this._buildButtons();
        this.infoOpen = false;

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onTouch = this._onTouch.bind(this);
        this.canvas.addEventListener('mousemove', this._onMouseMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchend', this._onTouch, { passive: false });

        this.t = 0;
        this._syncAudioState();

        // Ensure mobile controls are hidden on menu scene
        window.__mobileGameActive = false;
        if (window.updateMobileControls) window.updateMobileControls();
    }

    resize(width, height) {
    this.W = width;
    this.H = height;

    this.TILE_H = Math.round(this.H * 0.095);
    this.TILE_W = Math.round(this.TILE_H * 1.35);
    this.floorY = Math.round(this.H * 0.56);

    const charH = Math.round(this.H * 0.205);
    const charW = Math.round(charH * (this.FRAME_W / this.FRAME_H));

    this.chars = [
        { row: 2, x: this.W * 0.085 - charW * 0.5, w: charW, h: charH, frame: 0, frameT: 0, interval: 48 },
        { row: 0, x: this.W * 0.285 - charW * 0.5, w: charW, h: charH, frame: 4, frameT: 0, interval: 48 },
        { row: 3, x: this.W * 0.485 - charW * 0.5, w: charW, h: charH, frame: 9, frameT: 0, interval: 48 },
        { row: 1, x: this.W * 0.685 - charW * 0.5, w: charW, h: charH, frame: 2, frameT: 0, interval: 48 }
    ];

    this.targetTitleY = this.floorY - Math.round(this.H * 0.098);
    this.buttons = this._buildButtons();
}

    _syncAudioState() {
        this.muted = this.game.isAudioMuted ? this.game.isAudioMuted() : this.muted;
    }

    _buildButtons() {
        const BS = Math.round(Math.min(this.W, this.H) * 0.155);
        const PAD = Math.round(this.W * 0.009);
        const GAP = Math.round(PAD * 0.35);
        const PW = Math.round(BS * 2.1);
        const floorBot = this.floorY + this.TILE_H;
        const PY = Math.round(floorBot + (this.H - floorBot) / 2 - PW / 2);

        return [
            { id: 'info', x: PAD, y: PAD, w: BS, h: BS },
            { id: 'fullscreen', x: PAD + BS + GAP, y: PAD, w: BS, h: BS },
            { id: 'lang', x: this.W - PAD * 2 - BS * 2 - GAP, y: PAD, w: BS, h: BS },
            { id: 'audio', x: this.W - PAD - BS, y: PAD, w: BS, h: BS },
            { id: 'play', x: Math.round(this.W / 2 - PW / 2), y: PY, w: PW, h: PW }
        ];
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

    _hitBtn(pos) {
        for (const b of this.buttons) {
            if (pos.x >= b.x && pos.x <= b.x + b.w && pos.y >= b.y && pos.y <= b.y + b.h) {
                return b;
            }
        }
        return null;
    }

    _onMouseMove(e) {
        this.hoveredBtn = this._hitBtn(this._getPos(e))?.id || null;
    }

    _onTouch(e) {
        e.preventDefault();
        this._onClick(e);
    }

    _onClick(e) {
        const pos = this._getPos(e);
        if (this.infoOpen) {
            const r = this._infoCardRect();
            if (pos.x < r.cx || pos.x > r.cx + r.cw || pos.y < r.cy || pos.y > r.cy + r.ch) {
                this.infoOpen = false;
            }
            return;
        }

        const btn = this._hitBtn(pos);
        if (btn) this._handleButton(btn.id);
    }

    _handleButton(id) {
        playUiClick(1);

        if (id === 'play') {
            this.game.setScene('levelselect');
        } else if (id === 'info') {
            this.infoOpen = !this.infoOpen;
        } else if (id === 'fullscreen') {
            this.game.toggleFullscreen();
        } else if (id === 'audio') {
            this.game.toggleAudio?.();
            this._syncAudioState();
        } else if (id === 'lang') {
            this.langFrame = (this.langFrame + 1) % 7;
        }
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('touchend', this._onTouch);
        document.removeEventListener('fullscreenchange', this._fsListener);
    }

    update(dt) {
        this.t += dt;

        if (this.loading) {
            this.loadProgress = Math.min(1, (performance.now() - this._loadStart) / 2200);
            if (this.loadProgress >= 1) this.loading = false;
            return;
        }

        if (!this.titleLanded) {
            this.titleVY += 0.72;
            this.titleY += this.titleVY;
            if (this.titleY >= this.targetTitleY) {
                this.titleY = this.targetTitleY;
                if (Math.abs(this.titleVY) > 4 && this.titleBounces < 3) {
                    this.titleVY = -this.titleVY * 0.36;
                    this.titleBounces++;
                } else {
                    this.titleVY = 0;
                    this.titleLanded = true;
                }
            }
        }

        if (this.reverseTimer > 0) {
            this.reverseTimer -= dt;
            if (this.reverseTimer <= 0) {
                this.groupDir *= -1;
                const startX = this.groupDir > 0 ? this.W * 0.085 : this.W * 0.915;
                this.chars.forEach((c, i) => {
                    c.x = startX + i * (this.W * 0.20);
                });
            }
        } else {
            let needReverse = false;
            for (const c of this.chars) {
                c.x += this.groupSpeed * this.groupDir;
                if ((this.groupDir > 0 && c.x > this.W + c.w * 1.1) || (this.groupDir < 0 && c.x < -c.w * 1.1)) {
                    needReverse = true;
                }

                c.frameT += dt;
                if (c.frameT >= c.interval) {
                    c.frameT -= c.interval;
                    c.frame = (c.frame + 1) % this.SS_COLS;
                }
            }
            if (needReverse) this.reverseTimer = 1200;
        }
    }

    draw() {
        const { ctx, W, H } = { ctx: this.ctx, W: this.W, H: this.H };

        if (this.loading) {
            this._drawLoading(ctx, W, H);
            return;
        }

        this._drawBg(ctx, W, H);
        this._drawFloor(ctx, W);
        this._drawTitle(ctx, W, H);
        this._drawChars(ctx);
        this._drawButtons(ctx, W, H);

        if (this.infoOpen) this._drawInfoCard(ctx, W, H);
    }

    _drawLoading(ctx, W, H) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        const mouse = document.getElementById('img_200x200');
        const iconSize = Math.round(Math.min(W, H) * 0.28);
        if (mouse?.complete) {
            ctx.drawImage(mouse, Math.round(W / 2 - iconSize / 2), Math.round(H / 2 - iconSize * 1.18), iconSize, iconSize);
        }

        const bar = document.getElementById('img_progress_bar');
        const barW = Math.round(W * 0.42);
        const barY = Math.round(H / 2 + iconSize * 0.3);
        if (bar?.complete) {
            ctx.drawImage(bar, Math.round(W / 2 - barW / 2), barY, barW, Math.round(H * 0.008));
            ctx.fillStyle = '#ffe040';
            ctx.fillRect(Math.round(W / 2 - barW / 2), barY, barW * this.loadProgress, Math.round(H * 0.008));
        }
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(H * 0.048)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.loadProgress * 100)}%`, W / 2, barY + Math.round(H * 0.055));
    }

    _drawBg(ctx, W, H) {
        const bg = document.getElementById('img_bg_menu');
        if (bg?.complete) {
            const s = Math.max(W / bg.naturalWidth, H / bg.naturalHeight);
            ctx.drawImage(
                bg,
                Math.round((W - bg.naturalWidth * s) / 2),
                Math.round((H - bg.naturalHeight * s) / 2),
                Math.round(bg.naturalWidth * s),
                Math.round(bg.naturalHeight * s)
            );
        } else {
            ctx.fillStyle = '#b0a070';
            ctx.fillRect(0, 0, W, H);
        }
    }

    _drawFloor(ctx, W) {
        const TW = this.TILE_W;
        const TH = this.TILE_H;
        const blocks = document.getElementById('img_blocks');
        const cols = Math.ceil(W / TW) + 12;
        for (let c = -8; c < cols; c++) {
            const tx = c * TW - Math.round(TW * 0.22);
            const ty = this.floorY;
            if (blocks?.complete) {
                const srcFW = Math.floor(blocks.naturalWidth / 15);
                ctx.drawImage(blocks, 0, 0, srcFW, blocks.naturalHeight, tx, ty, TW + Math.round(TW * 0.44), TH);
            }
        }
    }

    _drawChars(ctx) {
        const ss = document.getElementById('menuSceneSprites');
        if (!ss?.complete) return;
        for (const c of this.chars) {
            const srcX = c.frame * this.FRAME_W;
            const srcY = c.row * this.FRAME_H;
            const drawX = Math.round(c.x);
            const drawY = this.floorY - c.h + 38;

            ctx.save();
            if (this.groupDir < 0) {
                ctx.translate(drawX + c.w, drawY);
                ctx.scale(-1, 1);
                ctx.drawImage(ss, srcX, srcY, this.FRAME_W, this.FRAME_H, 0, 0, c.w, c.h);
            } else {
                ctx.drawImage(ss, srcX, srcY, this.FRAME_W, this.FRAME_H, drawX, drawY, c.w, c.h);
            }
            ctx.restore();
        }
    }

    _drawTitle(ctx, W) {
        const logo = document.getElementById('img_logo_menu');
        if (logo?.complete) {
            const lw = Math.min(W * 0.78, 820);
            const lh = lw * (logo.naturalHeight / logo.naturalWidth);
            ctx.drawImage(logo, Math.round(W / 2 - lw / 2), Math.round(this.titleY - lh / 2), Math.round(lw), Math.round(lh));
        }
    }

    _drawButtons(ctx) {
        for (const b of this.buttons) {
            ctx.save();
            if (this.hoveredBtn === b.id) {
                const cx = b.x + b.w / 2;
                const cy = b.y + b.h / 2;
                ctx.translate(cx, cy);
                ctx.scale(1.08, 1.08);
                ctx.translate(-cx, -cy);
            }
            this._drawBtn(ctx, b);
            ctx.restore();
        }
    }

    _drawBtn(ctx, b) {
        if (b.id === 'play') {
            this._drawPlayBtn(ctx, b);
            return;
        }
        this._woodSquare(ctx, b.x, b.y, b.w, b.h);

        const iconImg = document.getElementById(
            b.id === 'info' ? 'img_but_credits' :
            b.id === 'fullscreen' ? 'img_but_fullscreen' :
            b.id === 'lang' ? 'img_but_lang' :
            b.id === 'audio' ? 'img_but_audio' : ''
        );

        if (!iconImg?.complete) return;

        const sz = Math.round(b.w * 0.72);
        const ix = Math.round(b.x + (b.w - sz) / 2);
        const iy = Math.round(b.y + (b.h - sz) / 2);

        if (b.id === 'lang') {
            const frameW = Math.floor(iconImg.naturalWidth / 7);
            ctx.drawImage(iconImg, this.langFrame * frameW, 0, frameW, iconImg.naturalHeight, ix, iy, sz, sz);
        } else if (b.id === 'fullscreen' || b.id === 'audio') {
            const frameW = Math.floor(iconImg.naturalWidth / 2);
            const frame = b.id === 'fullscreen' ? (this.isFS ? 1 : 0) : (this.muted ? 1 : 0);
            ctx.drawImage(iconImg, frame * frameW, 0, frameW, iconImg.naturalHeight, ix, iy, sz, sz);
        } else {
            ctx.drawImage(iconImg, ix, iy, sz, sz);
        }
    }

    _drawPlayBtn(ctx, b) {
        const pulse = 0.82 + 0.18 * Math.sin(this.t * 0.007);
        ctx.globalAlpha = pulse;
        const img = document.getElementById('img_but_play');
        if (img?.complete) ctx.drawImage(img, b.x, b.y, b.w, b.h);
        ctx.globalAlpha = 1;
    }

    _woodSquare(ctx, x, y, w, h) {
        const r = Math.round(w * 0.17);
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;
        ctx.shadowBlur = 7;
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#e09030');
        g.addColorStop(0.45, '#b87018');
        g.addColorStop(1, '#6a3808');
        ctx.fillStyle = g;
        this._rrect(ctx, x, y, w, h, r);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#4a2200';
        ctx.lineWidth = Math.max(2, Math.round(w * 0.055));
        ctx.stroke();
    }

    _rrect(ctx, x, y, w, h, r) {
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

    _infoCardRect() {
        const cw = Math.round(Math.min(this.W * 0.52, 520));
        const ch = Math.round(cw * 0.72);
        return {
            cw,
            ch,
            cx: Math.round((this.W - cw) / 2),
            cy: Math.round((this.H - ch) / 2)
        };
    }

    _drawInfoCard(ctx, W, H) {
        const { cx, cy, cw, ch } = this._infoCardRect();

        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        const box = document.getElementById('msg_box');
        if (box?.complete) ctx.drawImage(box, cx, cy, cw, ch);

        const logo = document.getElementById('img_ctl_logo');
        if (logo?.complete) {
            const lw = Math.round(cw * 0.62);
            const lh = lw * (logo.naturalHeight / logo.naturalWidth);
            ctx.drawImage(logo, cx + (cw - lw) / 2, cy + ch * 0.22, lw, lh);
        }

        ctx.fillStyle = '#ffe040';
        ctx.font = `bold ${Math.round(cw * 0.085)}px "Arial Black"`;
        ctx.textAlign = 'center';
        ctx.fillText('DEVELOPED BY', cx + cw / 2, cy + ch * 0.48);

        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.round(cw * 0.052)}px Arial`;
        ctx.fillText('CODETHISLAB', cx + cw / 2, cy + ch * 0.58);
        ctx.fillText('ADVERGAMES CREATORS', cx + cw / 2, cy + ch * 0.66);
        ctx.fillText('WWW.CODETHISLAB.COM', cx + cw / 2, cy + ch * 0.78);

        const ss = document.getElementById('menuSceneSprites');
        if (ss?.complete) {
            const mouseSize = Math.round(cw * 0.18);
            ctx.drawImage(ss, 0, this.FRAME_H * 2, this.FRAME_W, this.FRAME_H, cx + cw * 0.04, cy + ch - mouseSize * 0.9, mouseSize, mouseSize);
        }

        const exitImg = document.getElementById('but_exit');
        const xSize = Math.round(cw * 0.095);
        if (exitImg?.complete) {
            ctx.drawImage(exitImg, cx + cw - xSize - 14, cy + 14, xSize, xSize);
        }
    }
}