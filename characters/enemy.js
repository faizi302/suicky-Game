import { applyGravity } from '../game/physics.js';
import { resolveMapCollision } from '../game/collision.js';

function extractFrameRects(img, frameCountHint = null) {
    const sheetW = img.naturalWidth;
    const sheetH = img.naturalHeight;

    const off = document.createElement('canvas');
    off.width = sheetW;
    off.height = sheetH;
    const ctx = off.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    const pixels = ctx.getImageData(0, 0, sheetW, sheetH).data;

    const charPerCol = new Int32Array(sheetW);
    for (let y = 0; y < sheetH; y++) {
        for (let x = 0; x < sheetW; x++) {
            const i = (y * sheetW + x) * 4;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];

            if (!(r < 30 && g < 30 && b < 30) && !(a < 10)) {
                charPerCol[x]++;
            }
        }
    }

    const gapThreshold = sheetH * 0.10;
    const segments = [];
    let inSeg = false;
    let segStart = 0;

    for (let x = 0; x < sheetW; x++) {
        if (charPerCol[x] >= gapThreshold && !inSeg) {
            segStart = x;
            inSeg = true;
        } else if (charPerCol[x] < gapThreshold && inSeg) {
            segments.push([segStart, x - 1]);
            inSeg = false;
        }
    }

    if (inSeg) segments.push([segStart, sheetW - 1]);

    if (segments.length > 1) {
        return segments.map(([sx, ex]) => {
            let minY = sheetH - 1;
            let maxY = 0;
            let found = false;

            for (let x = sx; x <= ex; x++) {
                for (let y = 0; y < sheetH; y++) {
                    const i = (y * sheetW + x) * 4;
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];
                    const a = pixels[i + 3];

                    if (!((r < 30 && g < 30 && b < 30) || a < 10)) {
                        found = true;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }
            }

            if (!found) {
                minY = 0;
                maxY = sheetH - 1;
            }

            return {
                x: sx,
                y: minY,
                w: ex - sx + 1,
                h: maxY - minY + 1
            };
        });
    }

    const count = frameCountHint || 1;
    const fw = Math.floor(sheetW / count);
    const rects = [];

    for (let i = 0; i < count; i++) {
        const sx = i * fw;
        const ex = (i === count - 1) ? sheetW - 1 : (i + 1) * fw - 1;
        rects.push({ x: sx, y: 0, w: ex - sx + 1, h: sheetH });
    }

    return rects;
}

class SpriteAnim {
    constructor(imgId, frameCountHint, frameInterval, loop = true) {
        this.img = document.getElementById(imgId);
        this.frameInterval = frameInterval;
        this.loop = loop;

        this.frameRects = [];
        this.frameCount = 0;
        this.ready = false;
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.done = false;

        this.load(frameCountHint);
    }

    load(hint) {
        if (!this.img) return;

        const process = () => {
            this.frameRects = extractFrameRects(this.img, hint);
            this.frameCount = this.frameRects.length;
            this.ready = true;
        };

        if (this.img.complete && this.img.naturalWidth > 0) {
            process();
        } else {
            this.img.addEventListener('load', process, { once: true });
        }
    }

    reset() {
        this.currentFrame = 0;
        this.frameTimer = 0;
        this.done = false;
    }

    update(dt) {
        if (!this.ready || this.done) return;

        this.frameTimer += dt;

        while (this.frameTimer >= this.frameInterval) {
            this.frameTimer -= this.frameInterval;

            if (this.currentFrame < this.frameCount - 1) {
                this.currentFrame++;
            } else if (this.loop) {
                this.currentFrame = 0;
            } else {
                this.done = true;
            }
        }
    }

    draw(ctx, drawX, drawY, drawW, drawH, flipX = false) {
        if (!this.ready || !this.frameRects.length) return;

        const frame = this.frameRects[this.currentFrame] || this.frameRects[0];

        ctx.save();

        if (flipX) {
            ctx.translate(drawX + drawW, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(
                this.img,
                frame.x, frame.y, frame.w, frame.h,
                0, drawY, drawW, drawH
            );
        } else {
            ctx.drawImage(
                this.img,
                frame.x, frame.y, frame.w, frame.h,
                drawX, drawY, drawW, drawH
            );
        }

        ctx.restore();
    }
}

export default class Enemy {
    constructor(game, x, y, patrolLeft, patrolRight, type) {
        this.game = game;
        this.tileSize = game.tileSize;

        // collision box
        this.width = 50;
        this.height = 50;

        this.x = x;
        this.y = y;

        this.vx = 0;
        this.vy = 0;

        this.speed = 1.5;
        this.direction = 1; // 1 = right, -1 = left

        this.patrolLeft = patrolLeft;
        this.patrolRight = patrolRight;

        this.type = type || 0;

        // FSM states: patrol -> chase -> dying -> dead
        this.state = 'patrol';

        this.detectRange = this.tileSize * 4;
        this.chaseSpeed = 2.1;

        this.deathTimer = 0;
        this.fadeDuration = 220;
        this.removeMe = false;

        this.renderHeight = Math.round(this.tileSize * 1.20);
        this.renderDead = Math.round(this.tileSize * 0.95);

        this.anims = {
            run: new SpriteAnim('enemyRunning', 16, 70, true),
            dead: new SpriteAnim('enemyDied', 25, 55, false)
        };

        this.currentAnim = 'run';
    }

    setAnim(name) {
        if (this.currentAnim === name) return;
        this.currentAnim = name;
        this.anims[name].reset();
    }

    canHurtPlayer() {
        return this.state === 'patrol' || this.state === 'chase';
    }

    shouldRemove() {
        return this.removeMe;
    }

    die() {
        if (this.state === 'dying' || this.state === 'dead') return;

        this.state = 'dying';
        this.deathTimer = 0;
        this.vx = 0;
        this.vy = -4;
        this.setAnim('dead');
        this.anims.dead.reset();
    }

    updateFSM(player) {
        if (this.state === 'dying' || this.state === 'dead') return;

        const enemyCenter = this.x + this.width * 0.5;
        const playerCenter = player.x + player.width * 0.5;
        const dx = playerCenter - enemyCenter;
        const sameLevel = Math.abs((player.y + player.height) - (this.y + this.height)) < this.tileSize * 1.2;

        if (Math.abs(dx) <= this.detectRange && sameLevel) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }
    }

    update(dt, map) {
        if (this.state === 'dead') return;

        if (this.state === 'dying') {
            this.deathTimer += dt;

            applyGravity(this);
            resolveMapCollision(this, map, this.tileSize);
            this.anims.dead.update(dt);

            if (this.anims.dead.done && this.deathTimer >= (this.anims.dead.frameCount * this.anims.dead.frameInterval) + this.fadeDuration) {
                this.state = 'dead';
                this.removeMe = true;
            }
            return;
        }

        // FSM using player position
        this.updateFSM(this.game.player);

        if (this.state === 'chase') {
            const enemyCenter = this.x + this.width * 0.5;
            const playerCenter = this.game.player.x + this.game.player.width * 0.5;

            if (playerCenter < enemyCenter) {
                this.direction = -1;
            } else {
                this.direction = 1;
            }

            this.vx = this.chaseSpeed * this.direction;

            // still respect patrol area
            if (this.x <= this.patrolLeft) {
                this.x = this.patrolLeft;
                this.direction = 1;
            }

            if (this.x + this.width >= this.patrolRight) {
                this.x = this.patrolRight - this.width;
                this.direction = -1;
            }
        } else {
            // patrol
            this.vx = this.speed * this.direction;

            if (this.x <= this.patrolLeft) {
                this.x = this.patrolLeft;
                this.direction = 1;
            }

            if (this.x + this.width >= this.patrolRight) {
                this.x = this.patrolRight - this.width;
                this.direction = -1;
            }
        }

        applyGravity(this);
        resolveMapCollision(this, map, this.tileSize);

        // wall hit -> reverse in patrol mode
        if (this.vx === 0 && this.state === 'patrol') {
            this.direction *= -1;
        }

        this.setAnim('run');
        this.anims.run.update(dt);
    }

    draw(ctx, camera) {
        if (this.state === 'dead') return;

        const bodyX = Math.floor(this.x - camera.x);
        const bodyY = Math.floor(this.y - camera.y);

        if (bodyX < -this.width - 20 || bodyX > camera.viewW + 20) return;

        const anim = this.anims[this.currentAnim];
        if (!anim || !anim.ready || !anim.frameRects.length) return;

        const frame = anim.frameRects[anim.currentFrame] || anim.frameRects[0];
        const aspect = frame.w / frame.h;
        const drawHeight = this.currentAnim === 'dead'
            ? this.renderDead
            : this.renderHeight;
        const drawWidth = Math.round(drawHeight * aspect);
        // stand on surface properly
        const drawX = Math.floor(bodyX + (this.width - drawWidth) * 0.5);
        const drawY = Math.floor(bodyY + this.height - drawHeight);

        if (this.state === 'dying' && this.anims.dead.done) {
            const deathAnimTime = this.anims.dead.frameCount * this.anims.dead.frameInterval;
            const fadeElapsed = Math.max(0, this.deathTimer - deathAnimTime);
            ctx.globalAlpha = Math.max(0, 1 - fadeElapsed / this.fadeDuration);
        }

        // sprite faces right by default, so flip when moving left
        const flipX = this.direction === -1;
        anim.draw(ctx, drawX, drawY, drawWidth, drawHeight, flipX);

        ctx.globalAlpha = 1;
    }
}