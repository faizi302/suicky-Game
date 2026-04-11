import { MAX_HEALTH } from '../characters/player.js';

export default class UI {
    constructor(canvas, sceneManager) {
        this.canvas = canvas;
        this.sceneManager = sceneManager;

        this.score = 0;
        this.coins = 0;
        this.totalCoins = 0;
        this.keys = 0;
        this.totalKeys = 1;

        this.gameOver = false;
        this.win = false;
        this.showGameOver = false;

        this.timerMax = 180 * 1000;
        this.timer = this.timerMax;
        this.totalScore = 0;

        this.settingsOpen = false;
        this.dropAnim = 0;

        this.showExit = false;
        this.showHelp = false;
        this.helpPage = 0;

        this.soundOn = true;
        this.isFullscreen = false;

        this.pendingRestart = false;
        this.pendingNext = false;

        this.mx = 0;
        this.my = 0;

        this._gearBtn = null;
        this._dropBtns = [];
        this._exitBtns = null;
        this._helpBtns = null;
        this._gameOverBtns = null;

        this.overlayAnim = 0;
        this._lastTouchAt = 0;

        // Health bar
        this.playerHealth = MAX_HEALTH;
        this._warningPulse = 0; // 0..1 oscillating for warning animation
        this._warningDir = 1;

        this._loadImages();
        this._bindEvents();
    }

    destroy() {
        this.canvas.removeEventListener('mousemove', this._onMove);
        this.canvas.removeEventListener('click', this._onClick);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this._onTouchCancel);
    }

    _loadImages() {
        const g = id => document.getElementById(id);

        this.imgScoreBg = g('score_bg');
        this.imgCoin = g('img_coin') || this._makeImg('assets/coin.png');
        this.imgKey = g('img_silver_key') || this._makeImg('assets/silver_key_0.png');
        this.imgSettings = g('but_settings');
        this.imgButHelp = g('but_help');
        this.imgButYes = g('but_yes');
        this.imgButRight = g('but_right');
        this.imgButExit = g('but_exit');
        this.imgMsgBox = g('msg_box');
        this.imgHelpKeys = g('help_keyboard');
        this.imgHelpSpace = g('help_spacebar');
        this.imgAudio = g('img_but_audio');
        this.imgFullscreen = g('img_but_fullscreen');

        this.imgHome = g('but_home');
        this.imgRestart = g('but_restart');
        this.imgNext = g('but_next') || g('but_right');
    }

    _makeImg(src) {
        const i = new Image();
        i.src = src;
        return i;
    }

    _bindEvents() {
        this._onMove = this._onMouseMove.bind(this);
        this._onClick = this._onMouseClick.bind(this);
        this._onTouchStart = this._handleTouchStart.bind(this);
        this._onTouchEnd = this._handleTouchEnd.bind(this);
        this._onTouchCancel = this._handleTouchCancel.bind(this);

        this.canvas.addEventListener('mousemove', this._onMove);
        this.canvas.addEventListener('click', this._onClick);
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
        this.canvas.addEventListener('touchend', this._onTouchEnd, { passive: false });
        this.canvas.addEventListener('touchcancel', this._onTouchCancel, { passive: false });
    }

    addCoin() {
        this.coins++;
        this.score += 10;
    }

    addScore(n) {
        this.score += n;
    }

    getTimeString() {
        const ms = Math.max(0, this.timer);
        const sec = Math.ceil(ms / 1000);
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    update(dt) {
        const speed = dt / 150;
        if (this.settingsOpen) this.dropAnim = Math.min(1, this.dropAnim + speed);
        else this.dropAnim = Math.max(0, this.dropAnim - speed);

        const overlayTarget = (this.gameOver || this.showGameOver || this.showExit || this.showHelp) ? 1 : 0;
        if (overlayTarget) this.overlayAnim = Math.min(1, this.overlayAnim + dt / 220);
        else this.overlayAnim = Math.max(0, this.overlayAnim - dt / 220);

        this.isFullscreen = !!document.fullscreenElement;

        // Animate warning pulse when health is low (<=25)
        if (this.playerHealth <= 25 && this.playerHealth > 0) {
            const pulseSpeed = dt / 280; // controls pulse speed
            this._warningPulse += pulseSpeed * this._warningDir;
            if (this._warningPulse >= 1) {
                this._warningPulse = 1;
                this._warningDir = -1;
            } else if (this._warningPulse <= 0) {
                this._warningPulse = 0;
                this._warningDir = 1;
            }
        } else {
            this._warningPulse = 0;
            this._warningDir = 1;
        }

        if (this.gameOver) return;

        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer = 0;
            this.gameOver = true;
            this.win = false;
            this.showGameOver = true;
        }
    }

    draw(ctx, W, H) {
        this._drawHUD(ctx, W, H);
        if (this.dropAnim > 0.01) this._drawDropdown(ctx, W, H);
        if (this.showHelp) this._drawHelpPanel(ctx, W, H);
        if (this.showExit) this._drawExitConfirm(ctx, W, H);
        if (this.gameOver || this.showGameOver) this._drawGameOver(ctx, W, H);
    }

    _drawHUD(ctx, W, H) {
        const isSmall = W < 900;
        const isMedium = W >= 900 && W < 1400;

        const safeTop = Math.round(Math.max(10, H * 0.018));
        const safeSide = Math.round(isSmall ? 8 : isMedium ? 14 : 18);

        const cardH = Math.round(isSmall ? 64 : isMedium ? 72 : 78);
        const leftW = Math.round(isSmall ? 100 : isMedium ? 120 : 150);
        const scoreW = Math.round(isSmall ? 100 : isMedium ? 120 : 150);
        const timerW = Math.round(isSmall ? 100 : isMedium ? 120 : 145);
        const gearS = Math.round(isSmall ? 46 : isMedium ? 52 : 58);
        const gap = Math.round(isSmall ? 8 : isMedium ? 10 : 12);
        const iconS = Math.round(isSmall ? 22 : isMedium ? 24 : 28);
        const padX = Math.round(isSmall ? 10 : isMedium ? 12 : 14);
        const fontSm = Math.round(isSmall ? 16 : isMedium ? 18 : 20);
        const fontLg = Math.round(isSmall ? 22 : isMedium ? 26 : 30);

        const leftX = safeSide;
        const leftY = safeTop;
        const scoreX = leftX + leftW + gap;
        const scoreY = safeTop;
        const gearX = W - safeSide - gearS;
        const gearY = safeTop;
        const timerX = gearX - gap - timerW;
        const timerY = safeTop;

        // Health bar — positioned below the top HUD cards
        const healthBarY = safeTop + cardH + gap;
        this._drawHealthBar(ctx, leftX, healthBarY, leftW + gap + scoreW, isSmall ? 12 : isMedium ? 14 : 16, W);

        this._drawCard(ctx, leftX, leftY, leftW, cardH);

        const keyY = leftY + Math.round(cardH * 0.32);
        const coinY = leftY + Math.round(cardH * 0.73);
        const innerX = leftX + padX;

        this._drawIcon(ctx, this.imgKey, innerX, keyY - 25, iconS, iconS, '🔑');
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${fontSm}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${this.keys}/${this.totalKeys || 1}`, innerX + iconS + 8, keyY - 8);

        this._drawIcon(ctx, this.imgCoin, innerX, coinY - 25, iconS, iconS, '🪙');
        ctx.fillText(`${this.coins}/${this.totalCoins}`, innerX + iconS + 8, coinY - 10);

        this._drawCard(ctx, scoreX, scoreY, scoreW, cardH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${fontSm}px Arial`;
        ctx.fillText('SCORE', scoreX + scoreW / 2, scoreY + 20);

        ctx.font = `bold ${fontLg}px Arial`;
        ctx.fillText(String(this.score), scoreX + scoreW / 2, scoreY + 50);

        this._drawCard(ctx, timerX, timerY, timerW, cardH);
        ctx.font = `bold ${fontSm}px Arial`;
        ctx.fillStyle = '#fff';
        ctx.fillText('TIME', timerX + timerW / 2, timerY + 20);

        ctx.fillStyle = this.timer < 30000 ? '#ff5555' : '#fff';
        ctx.font = `bold ${Math.round(fontLg * 0.9)}px Arial`;
        ctx.fillText(this.getTimeString(), timerX + timerW / 2, timerY + 50);

        this._drawImgBtn(
            ctx,
            this.imgSettings,
            gearX,
            gearY,
            gearS,
            gearS,
            this._hover(gearX, gearY, gearS, gearS)
        );

        this._gearBtn = { x: gearX, y: gearY, w: gearS, h: gearS };

        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    _drawHealthBar(ctx, x, y, totalWidth, barH, W) {
        const health = Math.max(0, Math.min(MAX_HEALTH, this.playerHealth || MAX_HEALTH));
        const ratio = health / MAX_HEALTH;
        const isLow = health <= 25;
        const isMediumHp = health <= 50 && health > 25;

        const radius = Math.round(barH / 2);
        const labelW = Math.round(totalWidth * 0.18); // "HP" label area
        const barX = x + labelW;
        const barW = totalWidth - labelW;
        const fillW = Math.round(barW * ratio);

        ctx.save();

        // Background track
        ctx.fillStyle = 'rgba(20, 8, 0, 0.75)';
        ctx.strokeStyle = 'rgba(200, 135, 42, 0.6)';
        ctx.lineWidth = 1.5;
        this._rr(ctx, barX, y, barW, barH, radius);
        ctx.fill();
        ctx.stroke();

        // Fill color based on health level
        let barColor;
        if (isLow) {
            // Warning: pulse between bright red and dark red
            const r1 = [220, 30, 30];
            const r2 = [255, 80, 80];
            const t = this._warningPulse;
            const r = Math.round(r1[0] + (r2[0] - r1[0]) * t);
            const g = Math.round(r1[1] + (r2[1] - r1[1]) * t);
            const b = Math.round(r1[2] + (r2[2] - r1[2]) * t);
            barColor = `rgb(${r},${g},${b})`;
        } else if (isMediumHp) {
            barColor = '#e8a020'; // orange
        } else {
            barColor = '#2ecc40'; // green
        }

        // Draw fill bar (clipped to rounded rect)
        if (fillW > 0) {
            ctx.save();
            this._rr(ctx, barX, y, barW, barH, radius);
            ctx.clip();
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, y, fillW, barH);

            // Glossy highlight on fill
            const grad = ctx.createLinearGradient(barX, y, barX, y + barH);
            grad.addColorStop(0, 'rgba(255,255,255,0.28)');
            grad.addColorStop(0.5, 'rgba(255,255,255,0.06)');
            grad.addColorStop(1, 'rgba(0,0,0,0.10)');
            ctx.fillStyle = grad;
            ctx.fillRect(barX, y, fillW, barH);

            ctx.restore();
        }

        // Warning glow outline when low health
        if (isLow) {
            const glowAlpha = 0.3 + this._warningPulse * 0.55;
            ctx.save();
            ctx.shadowColor = '#ff2020';
            ctx.shadowBlur = 10 + this._warningPulse * 10;
            ctx.strokeStyle = `rgba(255, 50, 50, ${glowAlpha})`;
            ctx.lineWidth = 2.5;
            this._rr(ctx, barX, y, barW, barH, radius);
            ctx.stroke();
            ctx.restore();
        }

        // "HP" label
        ctx.fillStyle = isLow ? `rgba(255, ${Math.round(60 + this._warningPulse * 80)}, 60, 1)` : '#ffffff';
        ctx.font = `bold ${Math.round(barH * 1.1)}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText('HP', barX - 5, y + barH / 2);

        // Health number inside bar
        if (barH >= 12) {
            ctx.fillStyle = 'rgba(255,255,255,0.90)';
            ctx.font = `bold ${Math.round(barH * 0.85)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${health}`, barX + barW / 2, y + barH / 2);
        }

        // "!" warning icon when low
        if (isLow) {
            const warnAlpha = 0.6 + this._warningPulse * 0.4;
            const warnX = barX + barW + 5;
            const warnY = y + barH / 2;
            ctx.fillStyle = `rgba(255, 80, 80, ${warnAlpha})`;
            ctx.font = `bold ${Math.round(barH * 1.3)}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('!', warnX, warnY);
        }

        ctx.restore();
    }

    _drawDropdown(ctx, W, H) {
        const isSmall = W < 900;
        const isMedium = W >= 900 && W < 1400;

        const bs = Math.round(isSmall ? 44 : isMedium ? 50 : 56);
        const gap = Math.round(isSmall ? 7 : isMedium ? 9 : 10);
        const gx = W - bs - Math.round(isSmall ? 8 : isMedium ? 14 : 18);
        const gy = Math.round(Math.max(10, H * 0.018));
        const t = this.dropAnim;

        const defs = [
            { id: 'exit', img: this.imgButExit, fallback: '✕' },
            { id: 'help', img: this.imgButHelp, fallback: '?' },
            { id: 'sound', img: this.imgAudio, fallback: this.soundOn ? '🔊' : '🔇' },
            { id: 'fullscreen', img: this.imgFullscreen, fallback: '⛶' },
        ];

        this._dropBtns = [];

        defs.forEach((d, i) => {
            const targetY = gy + (bs + gap) * (i + 1);
            const y = gy + (targetY - gy) * t;

            ctx.save();
            ctx.globalAlpha = t;

            if (d.id === 'sound' && d.img?.complete && d.img.naturalWidth > 0) {
                const fw = d.img.naturalWidth / 2;
                const frame = this.soundOn ? 0 : 1;
                ctx.drawImage(d.img, frame * fw, 0, fw, d.img.naturalHeight, gx, y, bs, bs);
            } else if (d.id === 'fullscreen' && d.img?.complete && d.img.naturalWidth > 0) {
                const fw = d.img.naturalWidth / 2;
                const frame = this.isFullscreen ? 1 : 0;
                ctx.drawImage(d.img, frame * fw, 0, fw, d.img.naturalHeight, gx, y, bs, bs);
            } else if (d.img?.complete && d.img.naturalWidth > 0) {
                ctx.drawImage(d.img, gx, y, bs, bs);
            } else {
                this._fallbackBtn(ctx, gx, y, bs, bs, d.fallback, false);
            }

            ctx.restore();

            if (t > 0.4) {
                this._dropBtns.push({ id: d.id, x: gx, y, w: bs, h: bs });
            }
        });
    }

    _drawHelpPanel(ctx, W, H) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.overlayAnim);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        const bW = Math.min(W * 0.88, 520);
        const bH = Math.min(H * 0.88, 370);
        const bX = (W - bW) / 2;
        const bY = (H - bH) / 2;

        ctx.translate(W / 2, H / 2);
        const s = 0.92 + this.overlayAnim * 0.08;
        ctx.scale(s, s);
        ctx.translate(-W / 2, -H / 2);

        this._drawMsgBox(ctx, bX, bY, bW, bH);

        const sc = bW / 520;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(24 * sc)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('CONTROLS', W / 2, bY + bH * 0.15);

        if (this.helpPage === 0) {
            const kImg = this.imgHelpKeys;
            if (kImg && kImg.complete && kImg.naturalWidth > 0) {
                const fW = Math.round(kImg.naturalWidth / 2);
                const fH = Math.round(kImg.naturalHeight / 4);
                const ks = Math.round(46 * sc);
                ctx.drawImage(kImg, 0, 0, fW, fH, W / 2 - ks / 2, bY + bH * 0.22, ks, ks);
                ctx.drawImage(kImg, 0, fH, fW, fH, W / 2 - ks / 2, bY + bH * 0.40, ks, ks);
                ctx.drawImage(kImg, 0, fH * 2, fW, fH, W / 2 - ks * 1.7, bY + bH * 0.40, ks, ks);
                ctx.drawImage(kImg, 0, fH * 3, fW, fH, W / 2 + ks * 0.7, bY + bH * 0.40, ks, ks);
            }

            ctx.fillStyle = '#ffdd88';
            ctx.font = `bold ${Math.round(13 * sc)}px Arial`;
            ctx.fillText('Move', W / 2, bY + bH * 0.60);

            const sImg = this.imgHelpSpace;
            if (sImg && sImg.complete && sImg.naturalWidth > 0) {
                const sw = sImg.naturalWidth / 2;
                const sh = sImg.naturalHeight;
                const dw = Math.round(160 * sc);
                const dh = Math.round(46 * sc);
                ctx.drawImage(sImg, 0, 0, sw, sh, W / 2 - dw / 2, bY + bH * 0.65, dw, dh);
            }

            ctx.fillText('JUMP (Spacebar / ↑)', W / 2, bY + bH * 0.87);
        } else {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.round(15 * sc)}px Arial`;
            const lines = [
                'ESC or P → Pause',
                'F → Toggle Fullscreen',
                'Arrow Keys / WASD → Move',
                'Space / ↑ → Jump',
            ];
            lines.forEach((l, i) => ctx.fillText(l, W / 2, bY + bH * (0.30 + i * 0.16)));
        }

        const arW = Math.round(34 * sc);
        const arH = Math.round(44 * sc);
        const arLx = bX - arW - 8;
        const arRx = bX + bW + 8;
        const arY = (H - arH) / 2;

        ctx.save();
        ctx.translate(arLx + arW, arY);
        ctx.scale(-1, 1);
        if (this.imgButRight?.complete) ctx.drawImage(this.imgButRight, 0, 0, arW, arH);
        else this._fallbackBtn(ctx, 0, 0, arW, arH, '◀', false);
        ctx.restore();

        if (this.imgButRight?.complete) ctx.drawImage(this.imgButRight, arRx, arY, arW, arH);
        else this._fallbackBtn(ctx, arRx, arY, arW, arH, '▶', false);

        const tkS = Math.round(48 * sc);
        const tkX = bX + bW - tkS - 8;
        const tkY = bY + bH - tkS - 8;

        if (this.imgButYes?.complete) ctx.drawImage(this.imgButYes, tkX, tkY, tkS, tkS);
        else this._fallbackBtn(ctx, tkX, tkY, tkS, tkS, '✓', false);

        this._helpBtns = {
            left: { x: arLx, y: arY, w: arW, h: arH },
            right: { x: arRx, y: arY, w: arW, h: arH },
            tick: { x: tkX, y: tkY, w: tkS, h: tkS },
        };

        ctx.restore();
    }

    _drawExitConfirm(ctx, W, H) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.overlayAnim);
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        const bW = Math.min(W * 0.85, 460);
        const bH = Math.min(H * 0.75, 260);
        const bX = (W - bW) / 2;
        const bY = (H - bH) / 2;

        ctx.translate(W / 2, H / 2);
        const s = 0.92 + this.overlayAnim * 0.08;
        ctx.scale(s, s);
        ctx.translate(-W / 2, -H / 2);

        this._drawMsgBox(ctx, bX, bY, bW, bH);

        const sc = bW / 460;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.round(28 * sc)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('ARE YOU SURE?', W / 2, bY + bH * 0.36);

        ctx.font = `${Math.round(16 * sc)}px Arial`;
        ctx.fillStyle = '#ffdd88';
        ctx.fillText('Exit to main menu?', W / 2, bY + bH * 0.52);

        const btnS = Math.round(56 * sc);
        const btnY = bY + bH - btnS - Math.round(14 * sc);
        const noX = W / 2 - btnS - Math.round(10 * sc);
        const yesX = W / 2 + Math.round(10 * sc);

        if (this.imgButExit?.complete) ctx.drawImage(this.imgButExit, noX, btnY, btnS, btnS);
        else this._fallbackBtn(ctx, noX, btnY, btnS, btnS, '✕', false);

        if (this.imgButYes?.complete) ctx.drawImage(this.imgButYes, yesX, btnY, btnS, btnS);
        else this._fallbackBtn(ctx, yesX, btnY, btnS, btnS, '✓', false);

        this._exitBtns = {
            no: { x: noX, y: btnY, w: btnS, h: btnS },
            yes: { x: yesX, y: btnY, w: btnS, h: btnS },
        };

        ctx.restore();
    }

    _drawGameOver(ctx, W, H) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.overlayAnim);
        ctx.fillStyle = 'rgba(0,0,0,0.70)';
        ctx.fillRect(0, 0, W, H);

        const winMode = !!this.win;
        const boxW = Math.min(W * 0.86, winMode ? 600 : 540);
        const boxH = Math.min(H * 0.70, winMode ? 390 : 340);
        const boxX = (W - boxW) / 2;
        const boxY = (H - boxH) / 2 - Math.min(18, H * 0.02);
        const cx = W / 2;

        ctx.translate(cx, H / 2);
        const s = 0.88 + this.overlayAnim * 0.12;
        ctx.scale(s, s);
        ctx.translate(-cx, -H / 2);

        this._drawMsgBox(ctx, boxX, boxY, boxW, boxH);

        const titleY = boxY + boxH * 0.18;
        const scoreY = boxY + boxH * 0.43;
        const totalY = boxY + boxH * 0.61;

        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(boxH * 0.12)}px Arial Black, Arial`;

        if (winMode) ctx.fillText('CONGRATULATIONS!', cx, titleY);
        else ctx.fillText('GAME OVER', cx, titleY);

        ctx.font = `bold ${Math.round(boxH * 0.10)}px Arial Black, Arial`;
        ctx.fillText(`SCORE: ${this.score || 0}`, cx, scoreY);
        ctx.fillText(`TOTAL SCORE: ${(this.totalScore || 0) + (winMode ? 0 : this.score || 0)}`, cx, totalY);

        const btnSize = Math.round(Math.min(boxW * 0.17, 92));
        const btnGap = Math.round(btnSize * 0.33);
        const btnCount = winMode ? 3 : 2;
        const totalBtnsW = btnCount * btnSize + (btnCount - 1) * btnGap;
        const startX = cx - totalBtnsW / 2;
        const btnY = boxY + boxH * 0.73;

        const btns = [
            { id: 'home', img: this.imgHome, x: startX, y: btnY, w: btnSize, h: btnSize },
            { id: 'restart', img: this.imgRestart, x: startX + btnSize + btnGap, y: btnY, w: btnSize, h: btnSize }
        ];

        if (winMode) {
            btns.push({
                id: 'next',
                img: this.imgNext,
                x: startX + (btnSize + btnGap) * 2,
                y: btnY,
                w: btnSize,
                h: btnSize
            });
        }

        this._gameOverBtns = {};
        for (const b of btns) {
            const hov = this._hover(b.x, b.y, b.w, b.h);
            this._drawOverlayButton(ctx, b.img, b.x, b.y, b.w, b.h, hov, b.id);
            this._gameOverBtns[b.id] = { x: b.x, y: b.y, w: b.w, h: b.h };
        }

        ctx.restore();
    }

    _drawOverlayButton(ctx, img, x, y, w, h, hovered, id) {
        ctx.save();
        const scale = hovered ? 1.06 : 1;
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(scale, scale);
        ctx.translate(-(x + w / 2), -(y + h / 2));

        if (img?.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            const label = id === 'home' ? '⌂' : id === 'restart' ? '↺' : '▶';
            this._fallbackBtn(ctx, x, y, w, h, label, hovered);
        }

        ctx.restore();
    }

    _drawIcon(ctx, img, x, y, w, h, fallbackEmoji) {
        if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
        else {
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.round(w * 0.8)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(fallbackEmoji, x + w / 2, y + h / 2);
        }
    }

    _drawCard(ctx, x, y, w, h) {
        const img = this.imgScoreBg;
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.save();
            ctx.fillStyle = 'rgba(30,12,0,0.88)';
            ctx.strokeStyle = '#c8872a';
            ctx.lineWidth = 3;
            this._rr(ctx, x, y, w, h, 8);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    _drawMsgBox(ctx, x, y, w, h) {
        const img = this.imgMsgBox;
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.save();
            ctx.fillStyle = 'rgba(20,8,0,0.96)';
            ctx.strokeStyle = '#c8872a';
            ctx.lineWidth = 5;
            this._rr(ctx, x, y, w, h, 14);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    }

    _drawImgBtn(ctx, img, x, y, w, h, hov) {
        ctx.save();
        if (hov) {
            ctx.translate(x + w / 2, y + h / 2);
            ctx.scale(1.08, 1.08);
            ctx.translate(-(x + w / 2), -(y + h / 2));
        }
        if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
        else this._fallbackBtn(ctx, x, y, w, h, '⚙', hov);
        ctx.restore();
    }

    _fallbackBtn(ctx, x, y, w, h, label, hov) {
        ctx.save();
        ctx.fillStyle = hov ? 'rgba(200,135,42,0.95)' : 'rgba(40,18,5,0.88)';
        ctx.strokeStyle = '#c8872a';
        ctx.lineWidth = 2;
        this._rr(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `${Math.floor(h * 0.45)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
    }

    _rr(ctx, x, y, w, h, r) {
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

    _hover(x, y, w, h) {
        return this.mx >= x && this.mx <= x + w && this.my >= y && this.my <= y + h;
    }

    _getPos(clientX, clientY) {
        const r = this.canvas.getBoundingClientRect();
        const vw = this.canvas.width / (window.devicePixelRatio || 1);
        const vh = this.canvas.height / (window.devicePixelRatio || 1);
        const sx = vw / r.width;
        const sy = vh / r.height;
        return {
            x: (clientX - r.left) * sx,
            y: (clientY - r.top) * sy,
        };
    }

    _onMouseMove(e) {
        const p = this._getPos(e.clientX, e.clientY);
        this.mx = p.x;
        this.my = p.y;
    }

    _onMouseClick(e) {
        if (performance.now() - this._lastTouchAt < 450) return;
        const p = this._getPos(e.clientX, e.clientY);
        this._processClick(p.x, p.y);
    }

    _handleTouchStart(e) {
        if (!e.touches.length) return;
        const t = e.touches[0];
        const p = this._getPos(t.clientX, t.clientY);
        this.mx = p.x;
        this.my = p.y;
        e.preventDefault();
    }

    _handleTouchEnd(e) {
        if (!e.changedTouches.length) return;
        const t = e.changedTouches[0];
        const p = this._getPos(t.clientX, t.clientY);
        this.mx = p.x;
        this.my = p.y;
        this._lastTouchAt = performance.now();
        e.preventDefault();
        this._processClick(p.x, p.y);
    }

    _handleTouchCancel(e) {
        this._lastTouchAt = performance.now();
        e.preventDefault();
    }

    _processClick(mx, my) {
        const hit = b => b && mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h;

        if ((this.gameOver || this.showGameOver) && this._gameOverBtns) {
            if (hit(this._gameOverBtns.home)) {
                this._goHome();
                return;
            }
            if (hit(this._gameOverBtns.restart)) {
                this._restart();
                return;
            }
            if (hit(this._gameOverBtns.next)) {
                this.pendingNext = true;
                return;
            }
            return;
        }

        if (this.showExit && this._exitBtns) {
            if (hit(this._exitBtns.yes)) {
                this._goHome();
                return;
            }
            if (hit(this._exitBtns.no)) {
                this.showExit = false;
                return;
            }
            return;
        }

        if (this.showHelp && this._helpBtns) {
            if (hit(this._helpBtns.left)) {
                this.helpPage = Math.max(0, this.helpPage - 1);
                return;
            }
            if (hit(this._helpBtns.right)) {
                this.helpPage = Math.min(1, this.helpPage + 1);
                return;
            }
            if (hit(this._helpBtns.tick)) {
                this.showHelp = false;
                return;
            }
            return;
        }

        if (hit(this._gearBtn)) {
            this.settingsOpen = !this.settingsOpen;
            return;
        }

        if (this._dropBtns?.length) {
            for (const b of this._dropBtns) {
                if (hit(b)) {
                    this._handleDrop(b.id);
                    return;
                }
            }
        }

        if (this.settingsOpen) this.settingsOpen = false;
    }

    _handleDrop(id) {
        this.settingsOpen = false;
        switch (id) {
            case 'exit':
                this.showExit = true;
                break;
            case 'help':
                this.showHelp = true;
                this.helpPage = 0;
                break;
            case 'sound':
                this.soundOn = !this.soundOn;
                this._applySound();
                break;
            case 'fullscreen':
                this._toggleFS();
                break;
        }
    }

    _applySound() {
        const m = document.getElementById('snd_soundtrack');
        if (!m) return;
        if (this.soundOn) {
            m.volume = 0.35;
            m.play().catch(() => {});
        } else {
            m.pause();
        }
        if (this.sceneManager?.setAudioMuted) this.sceneManager.setAudioMuted(!this.soundOn);
    }

    _toggleFS() {
        const c = this.canvas;
        if (!document.fullscreenElement) {
            (c.requestFullscreen || c.webkitRequestFullscreen || c.msRequestFullscreen)?.call(c);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen)?.call(document);
        }
    }

    _goHome() {
        if (this.sceneManager?.setScene) this.sceneManager.setScene('menu');
        else window.location.reload();
    }

    _restart() {
        this.pendingRestart = true;
    }
}