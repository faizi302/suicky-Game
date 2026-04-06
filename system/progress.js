const STORAGE_KEY = 'platformer_progress_v3';
const SETTINGS_KEY = 'platformer_settings_v1';

export const TOTAL_LEVELS = 12;
export const DEFAULT_UNLOCKED_LEVELS = 1;

function safeParse(raw, fallback) {
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch {
        return fallback;
    }
}

export function readProgressStore() {
    const store = safeParse(localStorage.getItem(STORAGE_KEY), {
        levels: {},
        unlockedLevels: DEFAULT_UNLOCKED_LEVELS
    });

    if (!store.levels || typeof store.levels !== 'object') store.levels = {};
    if (!Number.isFinite(store.unlockedLevels)) store.unlockedLevels = DEFAULT_UNLOCKED_LEVELS;

    store.unlockedLevels = Math.max(
        DEFAULT_UNLOCKED_LEVELS,
        Math.min(TOTAL_LEVELS, Math.floor(store.unlockedLevels))
    );

    return store;
}

export function writeProgressStore(store) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
}

export function getLevelProgress(levelId) {
    const store = readProgressStore();
    return store.levels?.[String(levelId)] || null;
}

export function getUnlockedLevelsCount() {
    return readProgressStore().unlockedLevels || DEFAULT_UNLOCKED_LEVELS;
}

export function isLevelUnlocked(levelId) {
    return Number(levelId) <= getUnlockedLevelsCount();
}

export function getTotalLatestScore() {
    const store = readProgressStore();
    let total = 0;

    for (const value of Object.values(store.levels || {})) {
        total += Number(value?.latestScore || value?.score || 0);
    }

    return total;
}

export function saveLevelSnapshot(levelId, snapshot, options = {}) {
    const store = readProgressStore();
    const key = String(levelId);
    const prev = store.levels[key] || {};

    const normalized = {
        ...prev,
        ...snapshot,
        levelId: Number(levelId),
        latestScore: Number(snapshot?.latestScore ?? snapshot?.score ?? prev?.latestScore ?? 0),
        score: Number(snapshot?.latestScore ?? snapshot?.score ?? prev?.score ?? 0),
        coins: Number(snapshot?.coins ?? prev?.coins ?? 0),
        totalCoins: Number(snapshot?.totalCoins ?? prev?.totalCoins ?? 0),
        keys: Number(snapshot?.keys ?? prev?.keys ?? 0),
        totalKeys: Number(snapshot?.totalKeys ?? prev?.totalKeys ?? 0),
        updatedAt: Date.now(),
        win: Boolean(snapshot?.win ?? prev?.win),
        completed: Boolean(snapshot?.completed ?? snapshot?.win ?? prev?.completed)
    };

    store.levels[key] = normalized;

    if (options.completed || normalized.completed) {
        store.unlockedLevels = Math.max(
            store.unlockedLevels || DEFAULT_UNLOCKED_LEVELS,
            Math.min(TOTAL_LEVELS, Number(levelId) + 1)
        );
    }

    writeProgressStore(store);
    return normalized;
}

export function resetAllProgress() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {}
}

export function readSettings() {
    const settings = safeParse(localStorage.getItem(SETTINGS_KEY), { audioMuted: false });
    return {
        audioMuted: Boolean(settings.audioMuted)
    };
}

export function writeSettings(nextSettings) {
    const current = readSettings();
    const merged = { ...current, ...nextSettings };
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    } catch {}
    return merged;
}