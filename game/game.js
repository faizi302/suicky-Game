/**
 * game.js
 *
 * Moving platform updates:
 * - vertical platforms keep X locked
 * - horizontal platforms keep Y locked
 * - cement platforms use exact frames 6,7,8 from blocks.png
 * - tiles draw with a tiny overlap and source trim to remove seams
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
        this.worldWidth = this.mapCols * this.tileSize;
        this.worldHeight = this.mapRows * this.tileSize;

        if (this.ui && typeof this.ui.destroy === 'function') {
            this.ui.destroy();
        }

        this.ui = new UI(this.canvas, this.sceneManager);
        this.player = new Player(this);

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

        this.movingPlatforms = (level.movingPlatforms || []).map(p => ({
            ...p,
            _dir: 1,
            _baseX: p.x,
            _baseY: p.y
        }));

        this.items = [
            ...(level.coins || []).map(coin => new Coin(coin.x, coin.y, 'coin')),
            ...(level.keys || []).map(key => new Coin(key.x, key.y, 'key')),
            ...(level.knives || []).map(knife => new Coin(knife.x, knife.y, 'knife'))
        ];

        this.ui.totalCoins = (level.coins || []).length;
        this.ui.keys = 0;
        this.ui.totalKeys = (level.keys || []).length;
        this.targetKeys = (level.keys || []).length;

        this.dead = false;
        this._deathPending = false;
        this.missionComplete = false;
        this.winSceneOpened = false;
        this.doorOpened = false;
        this._doorSoundPlayed = false;
        this._doorLockedHintTimer = 0;
        this.climbGuideLadder = null;
        this.doorGuideVisible = false;
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

        this.ui.gameOver = true;
        this.ui.showGameOver = true;
        this.ui.win = false;

        playSound('snd_game_over_lose', 0.82, 100, true);
    }

    updateLadderState() {
        this.climbGuideLadder = null;

        const player = this.player;
        const ladders = this.levelData?.ladders || [];
        let touchingLadder = null;

        for (const ladder of ladders) {
            const inX =
                player.x + player.width * 0.5 >= ladder.x - 12 &&
                player.x + player.width * 0.5 <= ladder.x + ladder.width + 12;
            const inY =
                player.y + player.height >= ladder.y - 8 &&
                player.y <= ladder.y + ladder.height + 8;

            if (inX && inY) {
                touchingLadder = ladder;
                break;
            }
        }

        player.showClimbGuide = Boolean(touchingLadder);

        if (!player.isClimbing) {
            player.currentLadder = touchingLadder;
        }

        const wantsClimb =
            this.keys['ArrowUp'] || this.keys['w'] || this.keys['W'] ||
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
        const enoughKeys = (this.ui.keys || 0) >= this.targetKeys;
        const wasOpen = this.doorOpened;

        this.doorOpened = enoughKeys;

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
            this.missionComplete = true;
            this.ui.win = true;
            this.ui.gameOver = false;
            this.ui.showGameOver = false;

            saveLevelSnapshot(this.currentLevelId, {
                latestScore: this.ui.score || 0,
                score: this.ui.score || 0,
                coins: this.ui.coins || 0,
                totalCoins: this.ui.totalCoins || 0,
                keys: this.ui.keys || 0,
                totalKeys: this.ui.totalKeys || 0,
                win: true,
                completed: true
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
            this.player.update(this.keys, dt, this.map, this.movingPlatforms);
            this.camera.follow(this.player, this.worldWidth, this.worldHeight, dt);
            this.ui.update(dt);
            if (this.player.deadDone) this.onPlayerDeath();
            return;
        }

        this.ui.update(dt);
        if (this.ui.gameOver || this.missionComplete) return;

        this.updateLadderState();
        this.updateMovingPlatforms(dt);
        this.player.update(this.keys, dt, this.map, this.movingPlatforms);
        this.camera.follow(this.player, this.worldWidth, this.worldHeight, dt);

        for (const enemy of this.enemies) {
            enemy.update(dt, this.map);

            if (!this.player.alive || !enemy.canHurtPlayer()) continue;

            if (rectsOverlap(
                this.player.x, this.player.y, this.player.width, this.player.height,
                enemy.x, enemy.y, enemy.width, enemy.height
            )) {
                const playerBottom = this.player.y + this.player.height;
                const enemyTop = enemy.y + 10;
                const stompHit = playerBottom <= enemyTop + 14 && this.player.vy > 1.2;

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
        this.drawMovingPlatforms(ctx);

        for (const item of this.items) item.draw(ctx, this.camera);
        for (const enemy of this.enemies) enemy.draw(ctx, this.camera);
        this.player.draw(ctx, this.camera);

        this.drawClimbGuide(ctx);
        this.drawDoorHint(ctx);

        ctx.restore();

        this.ui.draw(ctx, this.width, this.height);
    }

    drawBackground(ctx) {
        const bg = this.bg;
        const viewH = this.camera.viewH;

        if (bg && bg.complete && bg.naturalWidth > 0) {
            const drawHeight = viewH;
            const drawWidth = bg.naturalWidth * (drawHeight / bg.naturalHeight);
            const parallaxX = -(this.camera.parallaxX * 0.2);
            const firstX = Math.floor(parallaxX % drawWidth) - drawWidth;

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

        const frameW = Math.round(img.naturalWidth / 2);
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
        ctx.font = 'bold 16px Arial';

        if (!this.doorOpened) {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            const text = `${this.ui.coins}/${this.levelData.totalCoinsRequiredToOpenDoor} coins • ${this.ui.keys}/${this.targetKeys} keys`;
            ctx.fillText(text, x, y);
        } else if (this.doorGuideVisible) {
            const img = document.getElementById('help_keyboard');
            if (img && img.complete && img.naturalWidth > 0) {
                const frameW = Math.round(img.naturalWidth / 2);
                const frameH = Math.round(img.naturalHeight / 4);
                ctx.drawImage(img, 0, 0, frameW, frameH, x - 22, y - 52, 44, 44);
            } else {
                ctx.fillStyle = '#fff';
                ctx.fillText('↑', x, y);
            }
        }
        ctx.restore();
    }

    updateMovingPlatforms(dt = 16.67) {
        if (!this.movingPlatforms || !this.movingPlatforms.length) return;

        const player = this.player;
        const step = dt / 16.67;

        for (const p of this.movingPlatforms) {
            if (p._baseX == null) p._baseX = p.x;
            if (p._baseY == null) p._baseY = p.y;
            if (p._dir == null) p._dir = 1;

            const prevX = p.x;
            const prevY = p.y;

            if (p.axis === 'x') {
                p.y = p._baseY;
                p.x += p.speed * step * p._dir;

                if (p.x >= p.max) {
                    p.x = p.max;
                    p._dir = -1;
                }
                if (p.x <= p.min) {
                    p.x = p.min;
                    p._dir = 1;
                }
            } else {
                p.x = p._baseX;
                p.y += p.speed * step * p._dir;

                if (p.y >= p.max) {
                    p.y = p.max;
                    p._dir = -1;
                }
                if (p.y <= p.min) {
                    p.y = p.min;
                    p._dir = 1;
                }
            }

            const dx = p.x - prevX;
            const dy = p.y - prevY;

            const onPlatform =
                player.alive &&
                !player.isClimbing &&
                player.x + player.width > p.x &&
                player.x < p.x + p.width &&
                Math.abs((player.y + player.height) - prevY) < 8;

            if (onPlatform) {
                player.x += dx;
                player.y += dy;
            }
        }
    }

getMovingPlatformFrames(p, numTiles) {
    // Highest priority: exact frames passed from level data
    if (Array.isArray(p.frameIndices) && p.frameIndices.length) {
        if (numTiles <= 1) {
            return [p.frameIndices[1] ?? p.frameIndices[0]];
        }
        if (numTiles === 2) {
            return [
                p.frameIndices[0],
                p.frameIndices[2] ?? p.frameIndices[1] ?? p.frameIndices[0]
            ];
        }
        return [
            p.frameIndices[0],
            ...Array(Math.max(0, numTiles - 2)).fill(
                p.frameIndices[1] ?? p.frameIndices[0]
            ),
            p.frameIndices[2] ?? p.frameIndices[1] ?? p.frameIndices[0]
        ];
    }

    // Old cement fallback
    const isCement = p.tileType === 6 || p.tileType === 7 || p.tileType === 8;

    if (isCement) {
        if (numTiles <= 1) return [7];
        if (numTiles === 2) return [6, 8];
        return [6, ...Array(Math.max(0, numTiles - 2)).fill(7), 8];
    }

    // Default wood fallback
    if (numTiles <= 1) return [1];
    if (numTiles === 2) return [0, 2];
    return [0, ...Array(Math.max(0, numTiles - 2)).fill(1), 2];
}

drawMovingPlatforms(ctx) {
    if (!this.movingPlatforms || !this.movingPlatforms.length) return;

    const img = document.getElementById('img_blocks')
        || document.getElementById('blocks')
        || document.getElementById('img_tiles')
        || document.getElementById('tiles');

    if (!img || !img.complete || img.naturalWidth === 0) return;

    // NEW blocks.png = 1800 x 120 with 15 frames in 1 row
    const FRAME_COUNT = 15;
    const frameW = img.naturalWidth / FRAME_COUNT;   // 120
    const frameH = img.naturalHeight;                // 120

    for (const p of this.movingPlatforms) {
        const screenX = Math.round(p.x - this.camera.x);
        const screenY = Math.round(p.y - this.camera.y);

        if (screenX + p.width < 0 || screenX > this.camera.viewW) continue;
        if (screenY + p.height < 0 || screenY > this.camera.viewH) continue;

        const numTiles = Math.max(1, Math.round(p.width / this.tileSize));
        const frames = this.getMovingPlatformFrames(p, numTiles);

        for (let i = 0; i < numTiles; i++) {
            const frameIdx = frames[Math.min(i, frames.length - 1)];

            const dx = Math.round(screenX + i * this.tileSize);
            const dy = Math.round(screenY);
            const dw = this.tileSize;
            const dh = this.tileSize;

            ctx.drawImage(
                img,
                frameIdx * frameW, 0, frameW, frameH,
                dx, dy, dw, dh
            );
        }
    }
}
}