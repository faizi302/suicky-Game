import MenuScene from '../scenes/MenuScene.js';
import LevelScene from '../scenes/levelScene.js';
import GamePlayScene from '../scenes/GamePlayScene.js';
import GamePauseScene from '../scenes/GamePauseScene.js';
import WinScene from '../scenes/winScene.js';
import { getTotalLatestScore } from '../system/progress.js';
import {
    isAudioMuted as readAudioMuted,
    setAudioMuted as applyAudioMuted,
    toggleAudioMuted,
    playMusic,
    setMusicVolume
} from '../system/soundSystem.js';

export default class SceneManager {
    constructor(canvas, ctx, width, height) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;

        this.currentLevel = 1;
        this.totalProgressUnits = 131;

        this.gamePlayScene = null;
        this.currentScene = null;
        this.currentSceneName = '';
        this.lastWinData = null;

        this.autoPausedByVisibility = false;

        this.ensureMusic();
        this.setScene('menu');
    }

    resize(width, height) {
        this.width = width;
        this.height = height;

        if (this.gamePlayScene?.resize) {
            this.gamePlayScene.resize(width, height);
        }

        if (this.currentScene && this.currentScene !== this.gamePlayScene && this.currentScene.resize) {
            this.currentScene.resize(width, height);
        }
    }

    ensureMusic() {
        const lowVol = this.currentSceneName === 'pause' ? 0.12 : 0.35;
        setMusicVolume(lowVol);
        playMusic(lowVol);
    }

    isAudioMuted() {
        return readAudioMuted();
    }

    setAudioMuted(muted) {
        applyAudioMuted(!!muted);
        this.ensureMusic();
    }

    toggleAudio() {
        toggleAudioMuted();
        this.ensureMusic();
    }

    getTotalScore() {
        return getTotalLatestScore();
    }

    syncMobileUiState() {
        const scene = this.currentSceneName;

        const controlsScenes = new Set(['gameplay']);
        const rotateScenes = new Set(['menu', 'levelselect', 'gameplay', 'pause', 'win']);

        window.__mobileGameActive = controlsScenes.has(scene);
        window.__requireLandscapeMode = rotateScenes.has(scene);

        if (window.updateMobileControls) {
            window.updateMobileControls();
        }
    }

    isGameplayActive() {
        return this.currentSceneName === 'gameplay';
    }

    isPauseActive() {
        return this.currentSceneName === 'pause';
    }

    pauseGameplay(auto = false) {
        if (!this.gamePlayScene) return;
        if (this.currentSceneName !== 'gameplay') return;

        this.autoPausedByVisibility = !!auto;
        this.setScene('pause', { auto });
    }

    resumeGameplay() {
        if (!this.gamePlayScene) return;

        this.autoPausedByVisibility = false;
        this.setScene('gameplay');
    }

    handleVisibilityChange(hidden) {
        if (hidden) {
            if (this.currentSceneName === 'gameplay') {
                this.pauseGameplay(true);
            }
            return;
        }

        if (this.autoPausedByVisibility && this.currentSceneName === 'pause') {
            // stay paused intentionally; user must press resume
            this.autoPausedByVisibility = false;
        }
    }

    setScene(name, payload = null) {
        if (name === 'menu') {
            this._destroyCurrent();

            if (this.gamePlayScene) {
                this.gamePlayScene.destroy?.();
                this.gamePlayScene = null;
            }

            this.currentScene = new MenuScene(this);
            this.currentSceneName = 'menu';
            this.ensureMusic();
            this.currentScene.resize?.(this.width, this.height);
            this.syncMobileUiState();
            return;
        }

        if (name === 'levelselect') {
            this._destroyCurrent();
            this.currentScene = new LevelScene(this);
            this.currentSceneName = 'levelselect';
            this.ensureMusic();
            this.currentScene.resize?.(this.width, this.height);
            this.syncMobileUiState();
            return;
        }

        if (name === 'gameplay') {
            if (this.currentSceneName === 'pause') {
                this.currentScene.destroy?.();
            } else {
                this._destroyCurrent();
            }

            if (!this.gamePlayScene) {
                this.gamePlayScene = new GamePlayScene(this);
            }

            this.currentScene = this.gamePlayScene;
            this.currentSceneName = 'gameplay';
            this.ensureMusic();
            this.currentScene.resize?.(this.width, this.height);
            this.syncMobileUiState();
            return;
        }

        if (name === 'pause') {
            if (this.currentSceneName !== 'pause' && this.currentSceneName !== 'gameplay') {
                this._destroyCurrent();
            }

            this.currentScene = new GamePauseScene(this, payload || {});
            this.currentSceneName = 'pause';
            this.ensureMusic();
            this.currentScene.resize?.(this.width, this.height);
            this.syncMobileUiState();
            return;
        }

        if (name === 'win') {
            this._destroyCurrent();
            this.lastWinData = payload || this.lastWinData || null;
            this.currentScene = new WinScene(this, this.lastWinData);
            this.currentSceneName = 'win';
            this.ensureMusic();
            this.currentScene.resize?.(this.width, this.height);
            this.syncMobileUiState();
            return;
        }
    }

    startLevel(levelNumber = 1) {
        this.currentLevel = Math.max(1, Number(levelNumber || 1));

        if (this.gamePlayScene) {
            this.gamePlayScene.destroy?.();
            this.gamePlayScene = null;
        }

        this.lastWinData = null;
        this.autoPausedByVisibility = false;
        this.setScene('gameplay');
    }

    showWin(payload = null) {
        this.lastWinData = payload || null;

        if (this.gamePlayScene) {
            this.gamePlayScene.destroy?.();
            this.gamePlayScene = null;
        }

        this.autoPausedByVisibility = false;
        this.setScene('win', payload);
    }

    _destroyCurrent() {
        if (this.currentScene && this.currentScene !== this.gamePlayScene) {
            this.currentScene.destroy?.();
        }
        this.currentScene = null;
    }

    toggleFullscreen() {
        const root = document.getElementById('game-root') || this.canvas;

        if (!document.fullscreenElement) {
            const fn =
                root.requestFullscreen ||
                root.webkitRequestFullscreen ||
                root.msRequestFullscreen;
            if (fn) fn.call(root);
        } else {
            const fn =
                document.exitFullscreen ||
                document.webkitExitFullscreen ||
                document.msExitFullscreen;
            if (fn) fn.call(document);
        }

        setTimeout(() => {
            if (window.updateMobileControls) window.updateMobileControls();
        }, 120);
    }

    update(dt) {
        if (this.currentSceneName === 'pause') {
            this.currentScene?.update(dt);
            return;
        }

        this.currentScene?.update(dt);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.currentSceneName === 'pause') {
            if (this.gamePlayScene) this.gamePlayScene.draw();
            this.currentScene?.draw();
            return;
        }

        this.currentScene?.draw();
    }
}