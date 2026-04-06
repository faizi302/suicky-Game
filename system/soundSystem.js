import { readSettings, writeSettings } from '../system/progress.js';

let initialized = false;
let unlocked = false;
let settingsCache = null;

function getSettings() {
    if (!settingsCache) settingsCache = readSettings();
    return settingsCache;
}

function getAllAudio() {
    return Array.from(document.querySelectorAll('audio'));
}

function getAudio(id) {
    return document.getElementById(id);
}

function cleanupUnlockListeners() {
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
}

function syncMutedStateToDom() {
    const muted = Boolean(getSettings().audioMuted);
    for (const audio of getAllAudio()) {
        audio.muted = muted;
    }
    return muted;
}

export function initSoundSystem() {
    if (initialized) {
        syncMutedStateToDom();
        return;
    }

    initialized = true;
    syncMutedStateToDom();

    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
}

export function unlockAudio() {
    if (unlocked) return true;

    unlocked = true;
    cleanupUnlockListeners();
    syncMutedStateToDom();

    const music = getAudio('snd_soundtrack');
    if (music && !isAudioMuted()) {
        music.loop = true;
        if (!Number.isFinite(music.volume) || music.volume <= 0) {
            music.volume = 0.35;
        }
        music.play().catch(() => {});
    }

    return true;
}

export function isAudioUnlocked() {
    return unlocked;
}

export function isAudioMuted() {
    return Boolean(getSettings().audioMuted);
}

export function setAudioMuted(muted) {
    settingsCache = writeSettings({ audioMuted: !!muted });
    const isMuted = syncMutedStateToDom();

    const music = getAudio('snd_soundtrack');
    if (music) {
        music.loop = true;
        music.muted = isMuted;

        if (isMuted) {
            music.pause();
        } else if (unlocked) {
            music.play().catch(() => {});
        }
    }

    return isMuted;
}

export function toggleAudioMuted() {
    return setAudioMuted(!isAudioMuted());
}

export function setMusicVolume(volume = 0.35) {
    const music = getAudio('snd_soundtrack');
    if (!music) return;

    const safeVolume = Math.max(0, Math.min(1, Number(volume) || 0));
    music.volume = safeVolume;
}

export function playMusic(volume = 0.35) {
    const music = getAudio('snd_soundtrack');
    if (!music) return;

    music.loop = true;
    music.volume = Math.max(0, Math.min(1, Number(volume) || 0.35));
    music.muted = isAudioMuted();

    if (music.muted || !unlocked) return;
    music.play().catch(() => {});
}

export function pauseMusic() {
    const music = getAudio('snd_soundtrack');
    if (music) music.pause();
}

export function playSfx(id, volume = 1, restart = true) {
    const audio = getAudio(id);
    if (!audio || isAudioMuted()) return;

    if (!unlocked) unlockAudio();

    try {
        audio.muted = false;
        audio.volume = Math.max(0, Math.min(1, Number(volume) || 0));

        if (!restart && !audio.paused && !audio.ended) {
            return;
        }

        if (restart) audio.currentTime = 0;
        audio.play().catch(() => {});
    } catch {}
}

export function playUiClick(volume = 1) {
    playSfx('snd_click', volume, true);
}
