import { applyGravity } from '../game/physics.js';
import { resolveMapCollision } from '../game/collision.js';
import { playSfx } from '../system/soundSystem.js';

const NORMAL_FRAME_COUNT = 15;
const FRAME_IDS = Array.from({ length: NORMAL_FRAME_COUNT }, (_, i) => `frame${i + 1}`);

const DIE_CLIMB_ID = 'die_climb';
const DC_FRAME_W = 230;
const DC_FRAME_H = 185;
const DC_ROW_DIE = 0;
const DC_ROW_CLIMB = 1;

const DRAW_W = 95;
const DRAW_H = 100;

const RUN_FRAME_MS = 92;
const CLIMB_FRAME_MS = 95;
const DIE_FRAME_MS = 90;
const TEST_MODE_NO_DEATH = false;

const soundLastTime = new Map();

export function playSound(id, volume = 1, cooldown = 0, restart = true) {
    const now = performance.now();
    const last = soundLastTime.get(id) || 0;
    if (cooldown > 0 && now - last < cooldown) return;
    soundLastTime.set(id, now);

    playSfx(id, volume, restart);
}

export default class Player {
    constructor(game) {
        this.game = game;
        this.tileSize = game.tileSize;

        this.width = 30;
        this.height = 35;

        this.x = 3 * this.tileSize;
        this.y = 10 * this.tileSize - this.height;

        this.vx = 0;
        this.vy = 0;

        this.speed = 0.48;
        this.maxSpeed = 2.7;
        this.friction = 0.84;
        this.jumpForce = -13;
        this.climbSpeed = 2.2;

        this.alive = true;
        this.onGround = false;
        this.facing = 1;

        this.isMoving = false;
        this.isClimbing = false;
        this.currentLadder = null;
        this.showClimbGuide = false;

        this.coyoteTime = 0;
        this.coyoteMax = 110;
        this.jumpBuffer = 0;
        this.jumpBufferMax = 120;

        this.frames = FRAME_IDS.map(id => document.getElementById(id));

        this.anim = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;

        this.climbFrame = 0;
        this.climbTimer = 0;

        this.deadFrame = 0;
        this.deadTimer = 0;
        this.deadDone = false;

        this._moveIntent = false;

        // moving platform support
        this.currentPlatform = null;
    }

die() {
    if (TEST_MODE_NO_DEATH) {
        return;
    }

    if (!this.alive) return;

    this.alive = false;
    this.vx = 0;
    this.vy = -7.2;
    this.currentPlatform = null;

    this.anim = 'dead';
    this.deadFrame = 0;
    this.deadTimer = 0;
    this.deadDone = false;

    if (document.getElementById('snd_die')) {
        playSound('snd_die', 0.9, 0, true);
    } else {
        playSound('snd_player_death', 0.9, 0, true);
    }
}

    bounceAfterEnemyKill() {
        this.vy = -8.2;
        this.onGround = false;
        this.currentPlatform = null;
        this.anim = 'jump';
        playSound('snd_bounce', 0.72, 70, true);
    }

    startClimbing(ladder) {
        this.currentLadder = ladder;
        this.isClimbing = true;
        this.currentPlatform = null;
        this.vx = 0;
        this.vy = 0;
        this.anim = 'climb';
    }

    stopClimbing() {
        this.isClimbing = false;
        this.currentLadder = null;
    }

    onCoinCollected() {
        playSound('snd_coin', 0.75, 40, true);
    }

    onKeyCollected() {
        playSound('snd_key', 0.85, 40, true);
    }

    onEnemyKilled(type = 0) {
        const id = `snd_enemy_${type}_death`;
        if (document.getElementById(id)) {
            playSound(id, 0.8, 50, true);
        } else {
            playSound('snd_enemy_0_death', 0.8, 50, true);
        }
        playSound('snd_puff', 0.6, 50, true);
    }

    onDoorOpened() {
        playSound('snd_lock_break', 0.85, 100, true);
        setTimeout(() => playSound('snd_door_open', 0.85, 100, true), 220);
    }

    onLockTremble() {
        playSound('snd_lock_tremble', 0.55, 220, true);
    }

    update(keys, dt, map, movingPlatforms = []) {
        if (!this.alive) {
            this._updateDeath(dt);
            return;
        }

        const left = keys['ArrowLeft'] || keys['a'] || keys['A'];
        const right = keys['ArrowRight'] || keys['d'] || keys['D'];
        const wantsUp = keys['ArrowUp'] || keys['w'] || keys['W'];
        const wantsDown = keys['ArrowDown'] || keys['s'] || keys['S'];
        const wantsJump = keys[' '];

        this._moveIntent = !!(left || right);

        if (this.currentLadder && (wantsUp || wantsDown)) {
            this.isClimbing = true;
        }

        if (this.isClimbing) {
            this._handleClimb(keys);
            this._updateClimbAnim(dt);
            return;
        }

        this.isMoving = false;

        if (right) {
            this.vx += this.speed * (dt * 0.1);
            this.facing = 1;
            this.isMoving = true;
        }

        if (left) {
            this.vx -= this.speed * (dt * 0.1);
            this.facing = -1;
            this.isMoving = true;
        }

        if (!left && !right) {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.08) this.vx = 0;
        }

        this.vx = Math.max(-this.maxSpeed, Math.min(this.vx, this.maxSpeed));

        if (this.onGround) this.coyoteTime = this.coyoteMax;
        else this.coyoteTime -= dt;

        if (wantsJump) this.jumpBuffer = this.jumpBufferMax;
        else this.jumpBuffer -= dt;

        if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
            this.vy = this.jumpForce;
            this.onGround = false;
            this.currentPlatform = null;
            this.jumpBuffer = 0;
            this.coyoteTime = 0;
            playSound('snd_jump', 0.65, 80, true);
        }

        const prevY = this.y;
        const prevBottom = prevY + this.height;
        const prevTop = prevY;

        applyGravity(this);
        resolveMapCollision(this, map, this.tileSize);
        this.resolveMovingPlatformCollision(movingPlatforms, prevTop, prevBottom);

        if (this.x < this.tileSize) {
            this.x = this.tileSize;
            this.vx = 0;
        }

        if (this.y > map.length * this.tileSize + 120) {
            this.die();
        }

        if (!this.onGround) {
            this.anim = 'jump';
        } else if (this._moveIntent) {
            this.anim = 'run';
            this._updateRunAnim(dt);
        } else {
            this.anim = 'idle';
            this.frameIndex = 0;
            this.frameTimer = 0;
        }
    }

    resolveMovingPlatformCollision(platforms = [], prevTop, prevBottom) {
        if (!platforms.length || !this.alive || this.isClimbing) {
            this.currentPlatform = null;
            return;
        }

        let landed = false;
        const currTop = this.y;
        const currBottom = this.y + this.height;

        for (const p of platforms) {
            const px = p.x;
            const py = p.y;
            const pw = p.width;
            const ph = p.height;

            const overlapX =
                this.x + this.width > px + 2 &&
                this.x < px + pw - 2;

            if (!overlapX) continue;

            // landing on top of platform while falling
            const wasAbove = prevBottom <= py + 6;
            const crossedTop = currBottom >= py && currBottom <= py + ph + 14;

            if (this.vy >= 0 && wasAbove && crossedTop) {
                this.y = py - this.height;
                this.vy = 0;
                this.onGround = true;
                this.currentPlatform = p;
                landed = true;
                continue;
            }

            // hit platform from below while jumping upward
            const wasBelow = prevTop >= py + ph - 4;
            const crossedBottom = currTop <= py + ph && currTop >= py - 14;

            if (this.vy < 0 && wasBelow && crossedBottom) {
                this.y = py + ph;
                this.vy = 0;
                continue;
            }
        }

        if (!landed) {
            const stillOnCurrent =
                this.currentPlatform &&
                this.x + this.width > this.currentPlatform.x + 2 &&
                this.x < this.currentPlatform.x + this.currentPlatform.width - 2 &&
                Math.abs((this.y + this.height) - this.currentPlatform.y) <= 10;

            if (!stillOnCurrent) {
                this.currentPlatform = null;
            }
        }
    }

    _handleClimb(keys) {
        if (!this.currentLadder) {
            this.stopClimbing();
            return;
        }

        const ladder = this.currentLadder;
        const wantsUp = keys['ArrowUp'] || keys['w'] || keys['W'];
        const wantsDown = keys['ArrowDown'] || keys['s'] || keys['S'];
        const left = keys['ArrowLeft'] || keys['a'] || keys['A'];
        const right = keys['ArrowRight'] || keys['d'] || keys['D'];

        const ladderCenter = ladder.x + ladder.width * 0.5;
        this.x = ladderCenter - this.width * 0.5-7;

        this.vx = 0;
        this.vy = 0;

        if (wantsUp) this.vy = -this.climbSpeed;
        else if (wantsDown) this.vy = this.climbSpeed;

        this.y += this.vy;

        const topExitY = ladder.y - this.height - 2;
        const bottomExitY = ladder.y + ladder.height - this.height;

        if (this.y <= topExitY) {
            this.y = topExitY;
            this.vy = 0;
            this.stopClimbing();
            this.onGround = false;
            return;
        }

        if (this.y >= bottomExitY) {
            this.y = bottomExitY;
            this.vy = 0;
            this.stopClimbing();
            this.onGround = true;
            return;
        }

        if (left || right) {
            this.stopClimbing();
            return;
        }

        this.anim = 'climb';
    }

    _updateRunAnim(dt) {
        this.frameTimer += dt;

        while (this.frameTimer >= RUN_FRAME_MS) {
            this.frameTimer -= RUN_FRAME_MS;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        }
    }

    _updateClimbAnim(dt) {
        if (Math.abs(this.vy) <= 0.05) return;

        this.climbTimer += dt;

        while (this.climbTimer >= CLIMB_FRAME_MS) {
            this.climbTimer -= CLIMB_FRAME_MS;
            this.climbFrame = (this.climbFrame + 1) % NORMAL_FRAME_COUNT;
        }
    }

    _updateDeath(dt) {
        this.vy += 0.48;
        this.y += this.vy;

        this.deadTimer += dt;
        while (this.deadTimer >= DIE_FRAME_MS) {
            this.deadTimer -= DIE_FRAME_MS;

            if (this.deadFrame < NORMAL_FRAME_COUNT - 1) {
                this.deadFrame++;
            } else {
                this.deadDone = true;
                break;
            }
        }
    }

    draw(ctx, camera) {
        const bodyX = Math.floor(this.x - camera.x);
        const bodyY = Math.floor(this.y - camera.y);

        const drawX = Math.floor(bodyX - 26);
        const drawY = Math.floor(bodyY - 38);

        ctx.save();
        ctx.imageSmoothingEnabled = false;

        const flip = this.facing === -1;

        if (this.anim === 'dead' || this.anim === 'climb') {
            const sheet = document.getElementById(DIE_CLIMB_ID);
            if (sheet && sheet.complete && sheet.naturalWidth > 0) {
                const row = this.anim === 'dead' ? DC_ROW_DIE : DC_ROW_CLIMB;
                const frame = this.anim === 'dead' ? this.deadFrame : this.climbFrame;
                const sx = frame * DC_FRAME_W;
                const sy = row * DC_FRAME_H;

                if (flip) {
                    ctx.translate(drawX + DRAW_W, drawY);
                    ctx.scale(-1, 1);
                    ctx.drawImage(sheet, sx, sy, DC_FRAME_W, DC_FRAME_H, 0, 0, DRAW_W, DRAW_H);
                } else {
                    ctx.drawImage(sheet, sx, sy, DC_FRAME_W, DC_FRAME_H, drawX, drawY, DRAW_W, DRAW_H);
                }
            }

            ctx.restore();
            return;
        }

        let img = this.frames[0];

        if (this.anim === 'run') {
            img = this.frames[this.frameIndex] || this.frames[0];
        } else if (this.anim === 'jump') {
            img = this.frames[5] || this.frames[0];
        } else {
            img = this.frames[0];
        }

        if (!img || !img.complete) {
            ctx.restore();
            return;
        }

        if (flip) {
            ctx.translate(drawX + DRAW_W, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, 0, DRAW_W, DRAW_H);
        } else {
            ctx.drawImage(img, drawX, drawY, DRAW_W, DRAW_H);
        }

        ctx.restore();
    }
}