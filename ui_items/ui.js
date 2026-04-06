// ═══════════════════════════════════════════════════════════════
//  ui.js  –  Fully responsive UI for any canvas size
//
//  Every pixel value is derived from W and H so the HUD, cards,
//  panels and game-over screen scale correctly on mobile.
// ═══════════════════════════════════════════════════════════════

export default class UI {

    // ─────────────────────────────────────────────────────────────
    constructor(canvas, sceneManager) {
        this.canvas       = canvas;
        this.sceneManager = sceneManager;

        // ── Game state ────────────────────────────────────────────
        this.score      = 0;
        this.coins      = 0;
        this.totalCoins = 0;
        this.keys       = 0;
        this.totalKeys  = 1;
        this.gameOver   = false;
        this.win        = false;
        this.showGameOver = false;

        // ── 3-minute countdown ────────────────────────────────────
        this.timerMax = 180 * 1000;
        this.timer    = this.timerMax;
        this.totalScore = 0;

        // ── Settings dropdown ─────────────────────────────────────
        this.settingsOpen = false;
        this.dropAnim     = 0;

        // ── Overlay panels ────────────────────────────────────────
        this.showExit = false;
        this.showHelp = false;
        this.helpPage = 0;

        // ── Sound / fullscreen ────────────────────────────────────
        this.soundOn      = true;
        this.isFullscreen = false;

        // ── Pending signals ───────────────────────────────────────
        this.pendingRestart = false;

        // ── Mouse / touch position (virtual canvas coords) ────────
        this.mx = 0;
        this.my = 0;

        // ── Stored hit rects ──────────────────────────────────────
        this._gearBtn      = null;
        this._dropBtns     = [];
        this._exitBtns     = null;
        this._helpBtns     = null;
        this._gameOverBtns = null;

        this._loadImages();
        this._bindEvents();
    }

    // ─────────────────────────────────────────────────────────────
    destroy() {
        this.canvas.removeEventListener('mousemove',  this._onMove);
        this.canvas.removeEventListener('click',      this._onClick);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchend',   this._onTouchEnd);
    }

    // ─────────────────────────────────────────────────────────────
    _loadImages() {
        const g = id => document.getElementById(id);

        this.imgScoreBg    = g('score_bg');
        this.imgCoin       = g('img_coin')       || this._makeImg('assets/coin.png');
        this.imgKey        = g('img_silver_key') || this._makeImg('assets/silver_key_0.png');
        this.imgSettings   = g('but_settings');
        this.imgButHelp    = g('but_help');
        this.imgButYes     = g('but_yes');
        this.imgButRight   = g('but_right');
        this.imgButExit    = g('but_exit');
        this.imgMsgBox     = g('msg_box');
        this.imgHelpKeys   = g('help_keyboard');
        this.imgHelpSpace  = g('help_spacebar');
        this.imgAudio      = g('img_but_audio');
        this.imgFullscreen = g('img_but_fullscreen');
    }

    _makeImg(src) {
        const i = new Image(); i.src = src; return i;
    }

    // ─────────────────────────────────────────────────────────────
    //  Bind mouse AND touch events
    // ─────────────────────────────────────────────────────────────
    _bindEvents() {
        this._onMove        = this._onMouseMove.bind(this);
        this._onClick       = this._onMouseClick.bind(this);
        this._onTouchStart  = this._handleTouchStart.bind(this);
        this._onTouchEnd    = this._handleTouchEnd.bind(this);

        this.canvas.addEventListener('mousemove',  this._onMove);
        this.canvas.addEventListener('click',      this._onClick);
        // Touch events for HUD buttons on mobile
        this.canvas.addEventListener('touchstart', this._onTouchStart, { passive: true });
        this.canvas.addEventListener('touchend',   this._onTouchEnd,   { passive: false });
    }

    // ─────────────────────────────────────────────────────────────
    //  Score helpers
    // ─────────────────────────────────────────────────────────────
    addCoin()   { this.coins++; this.score += 10; }
    addScore(n) { this.score += n; }

    getTimeString() {
        const ms  = Math.max(0, this.timer);
        const sec = Math.ceil(ms / 1000);
        const m   = Math.floor(sec / 60).toString().padStart(2, '0');
        const s   = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    // ─────────────────────────────────────────────────────────────
    //  Update
    // ─────────────────────────────────────────────────────────────
    update(dt) {
        const speed = dt / 150;
        if (this.settingsOpen) this.dropAnim = Math.min(1, this.dropAnim + speed);
        else                   this.dropAnim = Math.max(0, this.dropAnim - speed);

        this.isFullscreen = !!document.fullscreenElement;

        if (this.gameOver) return;

        this.timer -= dt;
        if (this.timer <= 0) {
            this.timer        = 0;
            this.gameOver     = true;
            this.win          = false;
            this.showGameOver = true;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Main draw entry
    // ─────────────────────────────────────────────────────────────
    draw(ctx, W, H) {
        this._drawHUD(ctx, W, H);
        if (this.dropAnim > 0.01)                         this._drawDropdown(ctx, W, H);
        if (this.showHelp)                                this._drawHelpPanel(ctx, W, H);
        if (this.showExit)                                this._drawExitConfirm(ctx, W, H);
        if (this.gameOver || this.showGameOver)           this._drawGameOver(ctx, W, H);
    }

    // ─────────────────────────────────────────────────────────────
    //  HUD  — all sizes relative to W & H
    // ─────────────────────────────────────────────────────────────
_drawHUD(ctx, W, H) {
    const isSmall = W < 900;
    const isMedium = W >= 900 && W < 1400;

    const safeTop = Math.round(Math.max(10, H * 0.018));
    const safeSide = Math.round(
        isSmall ? 8 :
        isMedium ? 14 :
        18
    );

    const cardH = Math.round(
        isSmall ? 64 :
        isMedium ? 72 :
        78
    );

    const leftW = Math.round(
        isSmall ? 170 :
        isMedium ? 200 :
        220
    );

    const scoreW = Math.round(
        isSmall ? 125 :
        isMedium ? 145 :
        160
    );

    const timerW = Math.round(
        isSmall ? 120 :
        isMedium ? 132 :
        145
    );

    const gearS = Math.round(
        isSmall ? 46 :
        isMedium ? 52 :
        58
    );

    const gap = Math.round(
        isSmall ? 8 :
        isMedium ? 10 :
        12
    );

    const iconS = Math.round(
        isSmall ? 22 :
        isMedium ? 24 :
        28
    );

    const padX = Math.round(
        isSmall ? 10 :
        isMedium ? 12 :
        14
    );

    const fontSm = Math.round(
        isSmall ? 16 :
        isMedium ? 18 :
        20
    );

    const fontLg = Math.round(
        isSmall ? 22 :
        isMedium ? 26 :
        30
    );

    let leftX = safeSide;
    let leftY = safeTop;

    let scoreX = leftX + leftW + gap;
    let scoreY = safeTop;

    let gearX = W - safeSide - gearS;
    let gearY = safeTop;

    let timerX = gearX - gap - timerW;
    let timerY = safeTop;

    // prevent overlap on narrower widths
    if (scoreX + scoreW + gap > timerX) {
        scoreX = leftX + leftW + 6;
        timerX = W - safeSide - gearS - gap - timerW;
    }

    // left card
    this._drawCard(ctx, leftX, leftY, leftW, cardH);

    const keyY = leftY + Math.round(cardH * 0.32);
    const coinY = leftY + Math.round(cardH * 0.73);
    const innerX = leftX + padX;

    this._drawIcon(ctx, this.imgKey, innerX, keyY - iconS / 2, iconS, iconS, '🔑');
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSm}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.keys}/${this.totalKeys || 1}`, innerX + iconS + 8, keyY);

    this._drawIcon(ctx, this.imgCoin, innerX, coinY - iconS / 2, iconS, iconS, '🪙');
    ctx.fillText(`${this.coins}/${this.totalCoins}`, innerX + iconS + 8, coinY);

    // score card
    this._drawCard(ctx, scoreX, scoreY, scoreW, cardH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fontSm}px Arial`;
    ctx.fillText('SCORE', scoreX + scoreW / 2, scoreY + Math.round(cardH * 0.30));

    ctx.font = `bold ${fontLg}px Arial`;
    ctx.fillText(String(this.score), scoreX + scoreW / 2, scoreY + Math.round(cardH * 0.72));

    // timer card
    this._drawCard(ctx, timerX, timerY, timerW, cardH);
    ctx.font = `bold ${fontSm}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.fillText('TIME', timerX + timerW / 2, timerY + Math.round(cardH * 0.30));

    ctx.fillStyle = this.timer < 30000 ? '#ff5555' : '#fff';
    ctx.font = `bold ${Math.round(fontLg * 0.9)}px Arial`;
    ctx.fillText(this.getTimeString(), timerX + timerW / 2, timerY + Math.round(cardH * 0.72));

    // settings button
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

    // ─────────────────────────────────────────────────────────────
    //  Settings Dropdown
    // ─────────────────────────────────────────────────────────────
_drawDropdown(ctx, W, H) {
    const isSmall = W < 900;
    const isMedium = W >= 900 && W < 1400;

    const bs = Math.round(
        isSmall ? 44 :
        isMedium ? 50 :
        56
    );

    const gap = Math.round(
        isSmall ? 7 :
        isMedium ? 9 :
        10
    );

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

    // ─────────────────────────────────────────────────────────────
    //  Help Panel
    // ─────────────────────────────────────────────────────────────
    _drawHelpPanel(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        const bW = Math.min(W * 0.88, 520);
        const bH = Math.min(H * 0.88, 370);
        const bX = (W - bW) / 2;
        const bY = (H - bH) / 2;
        this._drawMsgBox(ctx, bX, bY, bW, bH);

        const sc = bW / 520;
        ctx.fillStyle    = '#fff';
        ctx.font         = `bold ${Math.round(24 * sc)}px Arial`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('CONTROLS', W / 2, bY + bH * 0.15);

        if (this.helpPage === 0) {
            const kImg = this.imgHelpKeys;
            if (kImg && kImg.complete && kImg.naturalWidth > 0) {
                const fW = Math.round(kImg.naturalWidth  / 2);
                const fH = Math.round(kImg.naturalHeight / 4);
                const ks = Math.round(46 * sc);
                ctx.drawImage(kImg, 0,    0,    fW, fH, W/2 - ks/2,        bY + bH*0.22, ks, ks);
                ctx.drawImage(kImg, 0,    fH,   fW, fH, W/2 - ks/2,        bY + bH*0.40, ks, ks);
                ctx.drawImage(kImg, 0,    fH*2, fW, fH, W/2 - ks*1.7,      bY + bH*0.40, ks, ks);
                ctx.drawImage(kImg, 0,    fH*3, fW, fH, W/2 + ks*0.7,      bY + bH*0.40, ks, ks);
            }
            ctx.fillStyle    = '#ffdd88';
            ctx.font         = `bold ${Math.round(13 * sc)}px Arial`;
            ctx.textAlign    = 'center';
            ctx.fillText('Move', W/2, bY + bH * 0.60);

            const sImg = this.imgHelpSpace;
            if (sImg && sImg.complete && sImg.naturalWidth > 0) {
                const sw = sImg.naturalWidth / 2;
                const sh = sImg.naturalHeight;
                const dw = Math.round(160 * sc);
                const dh = Math.round(46  * sc);
                ctx.drawImage(sImg, 0, 0, sw, sh, W/2 - dw/2, bY + bH*0.65, dw, dh);
            }
            ctx.fillStyle = '#ffdd88';
            ctx.font      = `bold ${Math.round(13 * sc)}px Arial`;
            ctx.fillText('JUMP (Spacebar / ↑)', W/2, bY + bH * 0.87);
        } else {
            ctx.fillStyle = '#fff';
            ctx.font      = `${Math.round(15 * sc)}px Arial`;
            ctx.textAlign = 'center';
            const lines = [
                'ESC  or  P  →  Pause',
                'F  →  Toggle Fullscreen',
                'Arrow Keys / WASD  →  Move',
                'Space / ↑  →  Jump',
            ];
            lines.forEach((l, i) => {
                ctx.fillText(l, W/2, bY + bH * (0.30 + i * 0.16));
            });
        }

        // Nav arrows
        const arW = Math.round(34 * sc);
        const arH = Math.round(44 * sc);
        const arLx = bX - arW - 8;
        const arRx = bX + bW + 8;
        const arY  = (H - arH) / 2;

        ctx.save();
        ctx.translate(arLx + arW, arY);
        ctx.scale(-1, 1);
        if (this.imgButRight && this.imgButRight.complete) ctx.drawImage(this.imgButRight, 0, 0, arW, arH);
        else this._fallbackBtn(ctx, 0, 0, arW, arH, '◀', false);
        ctx.restore();
        if (this.imgButRight && this.imgButRight.complete) ctx.drawImage(this.imgButRight, arRx, arY, arW, arH);
        else this._fallbackBtn(ctx, arRx, arY, arW, arH, '▶', false);

        // Close tick
        const tkS = Math.round(48 * sc);
        const tkX = bX + bW - tkS - 8;
        const tkY = bY + bH - tkS - 8;
        if (this.imgButYes && this.imgButYes.complete) ctx.drawImage(this.imgButYes, tkX, tkY, tkS, tkS);
        else this._fallbackBtn(ctx, tkX, tkY, tkS, tkS, '✓', false);
        if (this._hover(tkX, tkY, tkS, tkS)) {
            ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 3;
            ctx.strokeRect(tkX - 2, tkY - 2, tkS + 4, tkS + 4);
        }

        // Page dots
        const dotR = Math.max(4, Math.round(5 * sc));
        ctx.fillStyle = this.helpPage === 0 ? '#FFD700' : '#555';
        ctx.beginPath(); ctx.arc(W/2 - dotR*3, bY + bH - dotR*2.5, dotR, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = this.helpPage === 1 ? '#FFD700' : '#555';
        ctx.beginPath(); ctx.arc(W/2 + dotR*3, bY + bH - dotR*2.5, dotR, 0, Math.PI*2); ctx.fill();

        ctx.textAlign    = 'left';
        ctx.textBaseline = 'alphabetic';

        this._helpBtns = {
            left:  { x: arLx, y: arY, w: arW, h: arH },
            right: { x: arRx, y: arY, w: arW, h: arH },
            tick:  { x: tkX,  y: tkY, w: tkS, h: tkS },
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  Exit Confirmation Panel
    // ─────────────────────────────────────────────────────────────
    _drawExitConfirm(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect(0, 0, W, H);

        const bW = Math.min(W * 0.85, 460);
        const bH = Math.min(H * 0.75, 260);
        const bX = (W - bW) / 2;
        const bY = (H - bH) / 2;
        this._drawMsgBox(ctx, bX, bY, bW, bH);

        const sc = bW / 460;
        ctx.fillStyle    = '#fff';
        ctx.font         = `bold ${Math.round(28 * sc)}px Arial`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText('ARE YOU SURE?', W / 2, bY + bH * 0.36);

        ctx.font      = `${Math.round(16 * sc)}px Arial`;
        ctx.fillStyle = '#ffdd88';
        ctx.fillText('Exit to main menu?', W / 2, bY + bH * 0.52);

        const btnS = Math.round(56 * sc);
        const btnY = bY + bH - btnS - Math.round(14 * sc);
        const noX  = W / 2 - btnS - Math.round(10 * sc);
        const yesX = W / 2 + Math.round(10 * sc);

        if (this.imgButExit && this.imgButExit.complete) ctx.drawImage(this.imgButExit, noX,  btnY, btnS, btnS);
        else this._fallbackBtn(ctx, noX,  btnY, btnS, btnS, '✕', false);
        if (this.imgButYes  && this.imgButYes.complete)  ctx.drawImage(this.imgButYes,  yesX, btnY, btnS, btnS);
        else this._fallbackBtn(ctx, yesX, btnY, btnS, btnS, '✓', false);

        if (this._hover(noX,  btnY, btnS, btnS)) { ctx.strokeStyle='#ff4444'; ctx.lineWidth=3; ctx.strokeRect(noX -2,btnY-2,btnS+4,btnS+4); }
        if (this._hover(yesX, btnY, btnS, btnS)) { ctx.strokeStyle='#44ff44'; ctx.lineWidth=3; ctx.strokeRect(yesX-2,btnY-2,btnS+4,btnS+4); }

        ctx.textAlign    = 'left';
        ctx.textBaseline = 'alphabetic';
        this._exitBtns = {
            no:  { x: noX,  y: btnY, w: btnS, h: btnS },
            yes: { x: yesX, y: btnY, w: btnS, h: btnS },
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  Game Over Panel
    // ─────────────────────────────────────────────────────────────
    _drawGameOver(ctx, W, H) {
        ctx.fillStyle = 'rgba(0,0,0,0.70)';
        ctx.fillRect(0, 0, W, H);

        const bW = Math.min(W * 0.88, 480);
        const bH = Math.min(H * 0.88, 320);
        const bX = (W - bW) / 2;
        const bY = (H - bH) / 2;
        this._drawMsgBox(ctx, bX, bY, bW, bH);

        const sc  = bW / 480;
        const cx  = W / 2;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'alphabetic';

        // Title
        if (this.win) {
            ctx.fillStyle = '#FFD700';
            ctx.font      = `bold ${Math.round(36 * sc)}px Arial`;
            ctx.fillText('YOU WIN! 🎉', cx, bY + bH * 0.24);
        } else {
            ctx.fillStyle = '#fff';
            ctx.font      = `bold ${Math.round(36 * sc)}px Arial`;
            ctx.fillText('GAME OVER', cx, bY + bH * 0.24);
        }

        // Stats
        ctx.fillStyle = '#fff';
        ctx.font      = `bold ${Math.round(18 * sc)}px Arial`;
        ctx.fillText('SCORE: '       + this.score,                          cx, bY + bH * 0.42);
        ctx.fillText('TOTAL SCORE: ' + (this.totalScore + this.score),      cx, bY + bH * 0.56);

        ctx.fillStyle = '#ffdd88';
        ctx.font      = `${Math.round(14 * sc)}px Arial`;
        ctx.fillText('Coins: ' + this.coins + ' / ' + this.totalCoins,      cx, bY + bH * 0.67);

        // Buttons
        const btnS   = Math.round(58 * sc);
        const btnGap = Math.round(18 * sc);
        const totalW = btnS * 2 + btnGap;
        const homeX  = cx - totalW / 2;
        const restX  = homeX + btnS + btnGap;
        const btnY   = bY + bH - btnS - Math.round(16 * sc);

        this._drawCard(ctx, homeX, btnY, btnS, btnS);
        ctx.font      = `${Math.round(26 * sc)}px Arial`;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🏠', homeX + btnS / 2, btnY + btnS / 2 + Math.round(2 * sc));

        this._drawCard(ctx, restX, btnY, btnS, btnS);
        ctx.fillText('🔄', restX + btnS / 2, btnY + btnS / 2 + Math.round(2 * sc));

        if (this._hover(homeX, btnY, btnS, btnS)) { ctx.strokeStyle='#FFD700'; ctx.lineWidth=3; ctx.strokeRect(homeX-2,btnY-2,btnS+4,btnS+4); }
        if (this._hover(restX, btnY, btnS, btnS)) { ctx.strokeStyle='#FFD700'; ctx.lineWidth=3; ctx.strokeRect(restX-2,btnY-2,btnS+4,btnS+4); }

        ctx.textAlign    = 'left';
        ctx.textBaseline = 'alphabetic';

        this._gameOverBtns = {
            home:    { x: homeX, y: btnY, w: btnS, h: btnS },
            restart: { x: restX, y: btnY, w: btnS, h: btnS },
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  Drawing helpers
    // ─────────────────────────────────────────────────────────────
    _drawIcon(ctx, img, x, y, w, h, fallbackEmoji) {
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.fillStyle    = '#fff';
            ctx.font         = `${Math.round(w * 0.8)}px Arial`;
            ctx.textAlign    = 'center';
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
            ctx.fillStyle   = 'rgba(30,12,0,0.88)';
            ctx.strokeStyle = '#c8872a';
            ctx.lineWidth   = 3;
            this._rr(ctx, x, y, w, h, 8);
            ctx.fill(); ctx.stroke();
            ctx.restore();
        }
    }

    _drawMsgBox(ctx, x, y, w, h) {
        const img = this.imgMsgBox;
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            ctx.save();
            ctx.fillStyle   = 'rgba(20,8,0,0.96)';
            ctx.strokeStyle = '#c8872a';
            ctx.lineWidth   = 5;
            this._rr(ctx, x, y, w, h, 14);
            ctx.fill(); ctx.stroke();
            ctx.restore();
        }
    }

    _drawImgBtn(ctx, img, x, y, w, h, hov) {
        ctx.save();
        if (hov) { ctx.translate(x+w/2, y+h/2); ctx.scale(1.08, 1.08); ctx.translate(-(x+w/2), -(y+h/2)); }
        if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
        else this._fallbackBtn(ctx, x, y, w, h, '⚙', hov);
        ctx.restore();
    }

    _fallbackBtn(ctx, x, y, w, h, label, hov) {
        ctx.save();
        ctx.fillStyle   = hov ? 'rgba(200,135,42,0.95)' : 'rgba(40,18,5,0.88)';
        ctx.strokeStyle = '#c8872a';
        ctx.lineWidth   = 2;
        this._rr(ctx, x, y, w, h, 8);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle    = '#fff';
        ctx.font         = Math.floor(h * 0.45) + 'px Arial';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w/2, y + h/2);
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        ctx.restore();
    }

    _rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
    }

    _hover(x, y, w, h) {
        return this.mx >= x && this.mx <= x+w && this.my >= y && this.my <= y+h;
    }

    // ─────────────────────────────────────────────────────────────
    //  Coordinate conversion: DOM pixels → virtual canvas coords
    // ─────────────────────────────────────────────────────────────
    _getPos(clientX, clientY) {
        const r   = this.canvas.getBoundingClientRect();
        // canvas CSS size vs virtual buffer size
        const vw  = this.canvas.width  / (window.devicePixelRatio || 1);
        const vh  = this.canvas.height / (window.devicePixelRatio || 1);
        const sx  = vw / r.width;
        const sy  = vh / r.height;
        return {
            x: (clientX - r.left) * sx,
            y: (clientY - r.top)  * sy,
        };
    }

    // ─────────────────────────────────────────────────────────────
    //  Mouse handlers
    // ─────────────────────────────────────────────────────────────
    _onMouseMove(e) {
        const p = this._getPos(e.clientX, e.clientY);
        this.mx = p.x; this.my = p.y;
    }

    _onMouseClick(e) {
        const p  = this._getPos(e.clientX, e.clientY);
        this._processClick(p.x, p.y);
    }

    // ─────────────────────────────────────────────────────────────
    //  Touch handlers (for HUD button taps on mobile)
    // ─────────────────────────────────────────────────────────────
    _handleTouchStart(e) {
        if (e.touches.length === 0) return;
        const t = e.touches[0];
        const p = this._getPos(t.clientX, t.clientY);
        this.mx = p.x; this.my = p.y;
    }

    _handleTouchEnd(e) {
        if (e.changedTouches.length === 0) return;
        const t = e.changedTouches[0];
        const p = this._getPos(t.clientX, t.clientY);
        this.mx = p.x; this.my = p.y;
        this._processClick(p.x, p.y);
    }

    // ─────────────────────────────────────────────────────────────
    //  Unified click / tap processing
    // ─────────────────────────────────────────────────────────────
    _processClick(mx, my) {
        const hit = b => b && mx >= b.x && mx <= b.x+b.w && my >= b.y && my <= b.y+b.h;

        if ((this.gameOver || this.showGameOver) && this._gameOverBtns) {
            if (hit(this._gameOverBtns.home))    { this._goHome();  return; }
            if (hit(this._gameOverBtns.restart)) { this._restart(); return; }
            return;
        }

        if (this.showExit && this._exitBtns) {
            if (hit(this._exitBtns.yes)) { this._goHome();        return; }
            if (hit(this._exitBtns.no))  { this.showExit = false; return; }
            return;
        }

        if (this.showHelp && this._helpBtns) {
            if (hit(this._helpBtns.left))  { this.helpPage = Math.max(0, this.helpPage-1); return; }
            if (hit(this._helpBtns.right)) { this.helpPage = Math.min(1, this.helpPage+1); return; }
            if (hit(this._helpBtns.tick))  { this.showHelp = false;                        return; }
            return;
        }

        if (hit(this._gearBtn)) {
            this.settingsOpen = !this.settingsOpen;
            return;
        }

        if (this._dropBtns && this._dropBtns.length) {
            for (const b of this._dropBtns) {
                if (hit(b)) { this._handleDrop(b.id); return; }
            }
        }

        if (this.settingsOpen) this.settingsOpen = false;
    }

    _handleDrop(id) {
        this.settingsOpen = false;
        switch (id) {
            case 'exit':       this.showExit = true;                      break;
            case 'help':       this.showHelp = true; this.helpPage = 0;  break;
            case 'sound':      this.soundOn = !this.soundOn; this._applySound(); break;
            case 'fullscreen': this._toggleFS();                           break;
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Actions
    // ─────────────────────────────────────────────────────────────
    _applySound() {
        const m = document.getElementById('snd_soundtrack');
        if (!m) return;
        if (this.soundOn) { m.volume = 0.35; m.play().catch(()=>{}); }
        else              { m.pause(); }
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