/**
 * game.js
 *
 * Camera zoom is now COMPUTED from the virtual canvas dimensions passed in
 * (width × height) so the visible game-world area is the same on every device.
 *
 * With the fixed VIRT_W=915 / VIRT_H=412 from main_scenes.js the zoom
 * calculation gives the same result everywhere, matching the PC experience.
 */

import Player, { playSound } from '../characters/player.js';
import Enemy from '../characters/enemy.js';
import Coin from '../ui_items/coin.js';
import UI from '../ui_items/ui.js';
import { drawMap } from '../levels/tileMap.js';
import { getLevelData } from '../levels/index.js';
import { createCamera } from './camera.js';
import { rectsOverlap } from './collision.js';
import { saveLevelSnapshot } from '../system/progress.js';

// ── Camera zoom helper ─────────────────────────────────────────────────────
/**
 * Compute a camera zoom so that the visible vertical world-space always
 * fits a target number of tile-rows (targetRows) inside the canvas height.
 *
 * targetRows = how many 40-px tiles should fit vertically on screen.
 * This value was tuned so the PC view (412 px tall, zoom≈1.7) shows ~6 rows.
 *
 * On every device with a fixed VIRT_H=412 this returns the same zoom,
 * giving an identical game-world area on mobile and desktop.
 */
function computeZoom(canvasW, canvasH, tileSize, targetRows) {
    const worldVisible = targetRows * tileSize;
    const zoomByH = canvasH / worldVisible;
    return Math.max(1.2, Math.min(zoomByH, 3.0));
}

const CAMERA_TARGET_ROWS = 12.5;

export default class Game {
    constructor(canvas, ctx, width, height, sceneManager) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.sceneManager = sceneManager;

        this.tileSize = 40;
        this.currentLevelId = 1;

        this.keys = {};
        this.keysBound = false;
        this.ui = null;

        this.bg = document.getElementById('bg');

        this.missionComplete = false;
        this.winSceneOpened = false;
        this.doorOpened = false;
        this.climbGuideLadder = null;
        this.doorGuideVisible = false;
        this.dead = false;
        this._deathPending = false;
        this._doorSoundPlayed = false;
        this._doorLockedHintTimer = 0;

        this.initInput();
    }

resize(width, height) {
    this.width = width;
    this.height = height;

    if (!this.camera) return;

    const autoZoom = computeZoom(width, height, this.tileSize, CAMERA_TARGET_ROWS);

    this.camera.resize(width, height);
    this.camera.minZoom = autoZoom;
    this.camera.maxZoom = autoZoom;
    this.camera.setZoom(autoZoom);
    this.camera.clamp(this.worldWidth, this.worldHeight);
}

    setLevel(levelId = 1) {
        this.currentLevelId = Number(levelId) || 1;
        this.reset();
    }

    reset() {
        const level = getLevelData(this.currentLevelId);

        this.map = level.grid;
        this.levelData = level;
        this.mapRows = this.map.length;
        this.mapCols = this.map[0].length;
        this.worldWidth  = this.mapCols * this.tileSize;
        this.worldHeight = this.mapRows * this.tileSize;

        if (this.ui && typeof this.ui.destroy === 'function') {
            this.ui.destroy();
        }

        this.ui = new UI(this.canvas, this.sceneManager);
        this.player = new Player(this);

        // ── Camera zoom: calculated so the visible area is the same on
        //    every device.  targetRows=6.1 was chosen to match the original
        //    PC appearance (412px canvas, zoom≈1.7 → viewH≈242 ≈ 6 rows).
        //    Because main_scenes.js now always passes VIRT_H=412, this
        //    produces zoom≈1.69 everywhere.
    //    const targetRows = 9.5;
const autoZoom = computeZoom(this.width, this.height, this.tileSize, CAMERA_TARGET_ROWS);

this.camera = createCamera(this.width, this.height, {
    zoom: autoZoom,
    minZoom: autoZoom,
    maxZoom: autoZoom,
    followOffsetX: 0.36,
    deadZoneW: 110,
    followStrengthX: 0.18,
    lockY: true,
    groundPadding: 80
});

        this.enemies = (level.enemies || []).map(enemy =>
            new Enemy(this, enemy.x, enemy.y, enemy.patrolLeft, enemy.patrolRight, enemy.type)
        );

        this.items = [
            ...(level.coins  || []).map(coin  => new Coin(coin.x,  coin.y,  'coin')),
            ...(level.keys   || []).map(key   => new Coin(key.x,   key.y,   'key')),
            ...(level.knives || []).map(knife => new Coin(knife.x, knife.y, 'knife'))
        ];

        this.ui.totalCoins = (level.coins || []).length;
        this.ui.keys       = 0;
        this.ui.totalKeys  = (level.keys  || []).length;
        this.targetKeys    = (level.keys  || []).length;

        this.dead              = false;
        this._deathPending     = false;
        this.missionComplete   = false;
        this.winSceneOpened    = false;
        this.doorOpened        = false;
        this._doorSoundPlayed  = false;
        this._doorLockedHintTimer = 0;
        this.climbGuideLadder  = null;
        this.doorGuideVisible  = false;
    }

    initInput() {
        if (this.keysBound) return;
        this.keysBound = true;

        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;

            if (e.key === 'f' || e.key === 'F') {
                this.toggleFullscreen();
                e.preventDefault();
            }

            if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

toggleFullscreen() {
    const root = document.getElementById('game-root') || this.canvas;

    if (!document.fullscreenElement) {
        (
            root.requestFullscreen ||
            root.webkitRequestFullscreen ||
            root.msRequestFullscreen
        )?.call(root);
    } else {
        (
            document.exitFullscreen ||
            document.webkitExitFullscreen ||
            document.msExitFullscreen
        )?.call(document);
    }

    setTimeout(() => {
        if (window.updateMobileControls) window.updateMobileControls();
    }, 120);
}

    onPlayerDeath() {
        if (this.dead || this.missionComplete) return;

        this.dead = true;
        this._deathPending = false;

        this.ui.gameOver    = true;
        this.ui.showGameOver = true;
        this.ui.win         = false;

        playSound('snd_game_over_lose', 0.82, 100, true);
    }

    updateLadderState() {
        this.climbGuideLadder = null;

        const player  = this.player;
        const ladders = this.levelData?.ladders || [];
        let touchingLadder = null;

        for (const ladder of ladders) {
            const inX =
                player.x + player.width * 0.5 >= ladder.x - 12 &&
                player.x + player.width * 0.5 <= ladder.x + ladder.width + 12;
            const inY =
                player.y + player.height >= ladder.y - 8 &&
                player.y <= ladder.y + ladder.height + 8;

            if (inX && inY) { touchingLadder = ladder; break; }
        }

        player.showClimbGuide  = Boolean(touchingLadder);

        if (!player.isClimbing) {
            player.currentLadder = touchingLadder;
        }

        const wantsClimb =
            this.keys['ArrowUp']   || this.keys['w'] || this.keys['W'] ||
            this.keys['ArrowDown'] || this.keys['s'] || this.keys['S'];

        if (touchingLadder) {
            this.climbGuideLadder = touchingLadder;
            if (wantsClimb && !player.isClimbing) player.startClimbing(touchingLadder);
        } else if (player.isClimbing) {
            player.stopClimbing();
        }
    }

    updateDoorState() {
        const enoughCoins = this.ui.coins >= (this.levelData?.totalCoinsRequiredToOpenDoor || 0);
        const enoughKeys  = (this.ui.keys || 0) >= this.targetKeys;
        const wasOpen     = this.doorOpened;

        this.doorOpened = enoughCoins && enoughKeys;

        if (this.doorOpened && !wasOpen && !this._doorSoundPlayed) {
            this._doorSoundPlayed = true;
            this.player.onDoorOpened();
        }

        if (!this.levelData?.door || this.missionComplete) return;

        const door = this.levelData.door;
        const hitX = door.x + 6;
        const hitY = door.y + 8;
        const hitW = 36;
        const hitH = 60;

        const touchingDoor = rectsOverlap(
            this.player.x, this.player.y, this.player.width, this.player.height,
            hitX, hitY, hitW, hitH
        );

        this.doorGuideVisible = touchingDoor;

        if (touchingDoor && !this.doorOpened) {
            this._doorLockedHintTimer = 900;
            this.player.onLockTremble();
        }

        const wantsOpen =
            this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'];

        if (touchingDoor && this.doorOpened && wantsOpen) {
            this.missionComplete   = true;
            this.ui.win            = true;
            this.ui.gameOver       = false;
            this.ui.showGameOver   = false;

            saveLevelSnapshot(this.currentLevelId, {
                latestScore: this.ui.score  || 0,
                score:       this.ui.score  || 0,
                coins:       this.ui.coins  || 0,
                totalCoins:  this.ui.totalCoins || 0,
                keys:        this.ui.keys   || 0,
                totalKeys:   this.ui.totalKeys  || 0,
                win:         true,
                completed:   true
            }, { completed: true });

            playSound('snd_game_over_win', 0.85, 100, true);
        }
    }

    update(dt) {
        if (!this.ui || !this.player || !this.map) return;

        if (this._doorLockedHintTimer > 0) {
            this._doorLockedHintTimer -= dt;
        }

        if (this._deathPending) {
            this.player.update(this.keys, dt, this.map);
            this.camera.follow(this.player, this.worldWidth, this.worldHeight, dt);
            this.ui.update(dt);
            if (this.player.deadDone) this.onPlayerDeath();
            return;
        }

        this.ui.update(dt);
        if (this.ui.gameOver || this.missionComplete) return;

        this.updateLadderState();
        this.player.update(this.keys, dt, this.map);
        this.camera.follow(this.player, this.worldWidth, this.worldHeight, dt);

        for (const enemy of this.enemies) {
            enemy.update(dt, this.map);

            if (!this.player.alive || !enemy.canHurtPlayer()) continue;

            if (rectsOverlap(
                this.player.x, this.player.y, this.player.width, this.player.height,
                enemy.x, enemy.y, enemy.width, enemy.height
            )) {
                const playerBottom = this.player.y + this.player.height;
                const enemyTop     = enemy.y + 10;
                const stompHit     = playerBottom <= enemyTop + 14 && this.player.vy > 1.2;

                if (stompHit) {
                    enemy.die();
                    this.player.bounceAfterEnemyKill();
                    this.ui.addScore(50);
                    this.player.onEnemyKilled(enemy.type ?? 0);
                } else {
                    this.player.die();
                }
            }
        }

        this.enemies = this.enemies.filter(enemy => !enemy.shouldRemove());

        for (const item of this.items) {
            item.update(dt);
            if (!this.player.alive) continue;

            const bounds = typeof item.getBounds === 'function'
                ? item.getBounds()
                : { x: item.x, y: item.y, width: item.width, height: item.height };

            const hit = rectsOverlap(
                this.player.x + 2, this.player.y + 2,
                this.player.width - 4, this.player.height - 2,
                bounds.x, bounds.y, bounds.width, bounds.height
            );

            if (!hit) continue;

            if (item.type === 'knife' || item.isDangerous) {
                this.player.die();
                continue;
            }

            if (!item.collected) {
                item.collect();
                if (item.type === 'coin') {
                    this.ui.addCoin();
                    this.player.onCoinCollected();
                } else if (item.type === 'key') {
                    this.ui.keys = (this.ui.keys || 0) + 1;
                    this.ui.addScore(100);
                    this.player.onKeyCollected();
                }
            }
        }

        this.items = this.items.filter(item => !item.remove);

        this.updateDoorState();

        if (!this.player.alive && !this.dead && !this._deathPending) {
            this._deathPending = true;
        }
    }

    draw(ctx) {
        if (!this.ui || !this.player || !this.camera) return;

        ctx.save();
        this.camera.applyWorldTransform(ctx);

        this.drawBackground(ctx);
        drawMap(ctx, this.map, this.tileSize, this.camera, this.levelData, this.doorOpened);

        for (const item  of this.items)   item.draw(ctx, this.camera);
        for (const enemy of this.enemies) enemy.draw(ctx, this.camera);
        this.player.draw(ctx, this.camera);

        this.drawClimbGuide(ctx);
        this.drawDoorHint(ctx);

        ctx.restore();

        // UI always drawn in virtual-canvas space (VIRT_W × VIRT_H)
        this.ui.draw(ctx, this.width, this.height);
    }

    drawBackground(ctx) {
        const bg    = this.bg;
        const viewH = this.camera.viewH;

        if (bg && bg.complete && bg.naturalWidth > 0) {
            const drawHeight  = viewH;
            const drawWidth   = bg.naturalWidth * (drawHeight / bg.naturalHeight);
            const parallaxX   = -(this.camera.parallaxX * 0.2);
            const firstX      = Math.floor(parallaxX % drawWidth) - drawWidth;

            for (let x = firstX; x < this.camera.viewW + drawWidth; x += drawWidth) {
                ctx.drawImage(bg, x, 0, drawWidth, drawHeight);
            }
            return;
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, viewH);
        gradient.addColorStop(0, '#c8b89a');
        gradient.addColorStop(1, '#e8d8b0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.camera.viewW, viewH);
    }

    drawClimbGuide(ctx) {
        if (!this.climbGuideLadder || !this.player.showClimbGuide) return;

        const img = document.getElementById('help_keyboard');
        if (!img || !img.complete || img.naturalWidth <= 0) return;

        const ladder = this.climbGuideLadder;
        const x = Math.floor(ladder.x - this.camera.x + ladder.width / 2 - 22);
        const y = Math.floor(ladder.y - this.camera.y - 48);

        const frameW = Math.round(img.naturalWidth  / 2);
        const frameH = Math.round(img.naturalHeight / 4);
        ctx.drawImage(img, 0, 0, frameW, frameH, x, y, 44, 44);
    }

    drawDoorHint(ctx) {
        if (!this.levelData?.door) return;

        const door = this.levelData.door;
        const x = Math.floor(door.x - this.camera.x + 26);
        const y = Math.floor(door.y - this.camera.y - 16);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font      = 'bold 16px Arial';

        if (!this.doorOpened) {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            const text = `${this.ui.coins}/${this.levelData.totalCoinsRequiredToOpenDoor} coins • ${this.ui.keys}/${this.targetKeys} keys`;
            ctx.fillText(text, x, y);
        } else if (this.doorGuideVisible) {
            const img = document.getElementById('help_keyboard');
            if (img && img.complete && img.naturalWidth > 0) {
                const frameW = Math.round(img.naturalWidth  / 2);
                const frameH = Math.round(img.naturalHeight / 4);
                ctx.drawImage(img, 0, 0, frameW, frameH, x - 22, y - 52, 44, 44);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillText('↑', x, y);
            }
        }
        ctx.restore();
    }
}