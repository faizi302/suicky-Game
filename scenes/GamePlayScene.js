import Game from '../game/game.js';
import { saveLevelSnapshot, getTotalLatestScore } from '../system/progress.js';

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export default class GamePlayScene {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.canvas = sceneManager.canvas;
        this.ctx = sceneManager.ctx;

        this.W = sceneManager.width;
        this.H = sceneManager.height;

        this.levelId = Number(sceneManager.currentLevel || 1);
        this.lastSaveAt = 0;
        this.saveInterval = 120;

        this.game = new Game(this.canvas, this.ctx, this.W, this.H, sceneManager);
        this.game.setLevel(this.levelId);

        this.totalProgressUnits = Number(
            this.game?.levelData?.progressUnits ||
            sceneManager.totalProgressUnits ||
            131
        );

        this._onKeyDown = this._handleKeyDown.bind(this);
        window.addEventListener('keydown', this._onKeyDown);

        this.sceneManager.ensureMusic?.();
        this._saveProgress(true);

        window.__mobileGameActive = true;
    }

    resize(width, height) {
        this.W = width;
        this.H = height;

        if (this.game?.resize) {
            this.game.resize(width, height);
        }
    }

    destroy() {
        this._saveProgress(true);
        window.removeEventListener('keydown', this._onKeyDown);
        if (this.game && this.game.ui) this.game.ui.destroy();
        window.__mobileGameActive = false;
    }

    internalReset() {
        if (this.game && this.game.ui) this.game.ui.destroy();

        this.levelId = Number(this.sceneManager.currentLevel || this.levelId || 1);
        this.game.setLevel(this.levelId);

        this.totalProgressUnits = Number(
            this.game?.levelData?.progressUnits ||
            this.sceneManager.totalProgressUnits ||
            131
        );

        this.game.resize?.(this.W, this.H);

        this.sceneManager.ensureMusic?.();
        this._saveProgress(true);

        window.__mobileGameActive = true;
    }

    _handleKeyDown(e) {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
            if (
                this.game &&
                this.game.ui &&
                !this.game.ui.gameOver &&
                !this.game.ui.showHelp &&
                !this.game.ui.showExit &&
                !this.game.missionComplete
            ) {
                this._saveProgress(true);
                this.sceneManager.setScene('pause');
                e.preventDefault();
            }
        }

        if (e.key === 'f' || e.key === 'F') {
            this.sceneManager.toggleFullscreen?.();
            e.preventDefault();
        }
    }

    _getLevelWidthPx() {
        const map = this.game?.map;
        const tileSize = this.game?.tileSize || 0;
        if (map && map.length && map[0] && tileSize > 0) return map[0].length * tileSize;
        return 0;
    }

    _buildSnapshot() {
        const ui = this.game?.ui;
        const player = this.game?.player;
        const elapsedMs = ui ? Math.max(0, (ui.timerMax || 0) - (ui.timer || 0)) : 0;
        const levelWidthPx = this._getLevelWidthPx();
        const playerX = player ? Number(player.x || 0) : 0;

        let progressRatio = 0;
        if (levelWidthPx > 0) progressRatio = clamp(playerX / levelWidthPx, 0, 1);

        const progressUnits = clamp(
            Math.round(progressRatio * this.totalProgressUnits),
            0,
            this.totalProgressUnits
        );

        return {
            levelId: this.levelId,
            latestScore: Number(ui?.score || 0),
            score: Number(ui?.score || 0),
            elapsedMs,
            coins: Number(ui?.coins || 0),
            totalCoins: Number(ui?.totalCoins || 0),
            keys: Number(ui?.keys || 0),
            totalKeys: Number(this.game?.targetKeys || 0),
            progressUnits,
            totalProgressUnits: this.totalProgressUnits,
            progressText: `${progressUnits}/${this.totalProgressUnits}`,
            playerX,
            levelWidthPx,
            gameOver: Boolean(ui?.gameOver),
            win: Boolean(this.game?.missionComplete),
            completed: Boolean(this.game?.missionComplete),
            updatedAt: Date.now(),
            doorOpened: Boolean(this.game?.doorOpened),
        };
    }

    _saveProgress(force = false) {
        const now = performance.now();
        if (!force && now - this.lastSaveAt < this.saveInterval) return;
        this.lastSaveAt = now;
        const snapshot = this._buildSnapshot();
        saveLevelSnapshot(this.levelId, snapshot, { completed: snapshot.completed });
    }

    update(dt) {
        if (!this.game) return;

        if (this.game.ui && this.game.ui.pendingRestart) {
            this.game.ui.pendingRestart = false;
            this.internalReset();
            return;
        }

        this.game.update(dt);
        this._saveProgress(false);

        if (this.game.missionComplete && !this.game.winSceneOpened) {
            this._saveProgress(true);
            this.game.winSceneOpened = true;
            window.__mobileGameActive = false;

            this.sceneManager.showWin({
                levelId: this.levelId,
                score: this.game.ui?.score || 0,
                totalScore: getTotalLatestScore(),
                coins: this.game.ui?.coins || 0,
                totalCoins: this.game.ui?.totalCoins || 0,
                keys: this.game.ui?.keys || 0,
                totalKeys: this.game.targetKeys || 0,
            });
        }

        if (this.game.ui?.gameOver) {
            this._saveProgress(true);
            window.__mobileGameActive = false;
        }
    }

    draw() {
        if (this.game) this.game.draw(this.ctx);
    }
}