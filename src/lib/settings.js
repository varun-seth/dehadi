const appSlug = import.meta.env.VITE_APP_SLUG;

const THEME_KEY = `${appSlug}.theme`;
const VIEW_KEY = `${appSlug}.actions.layout`;

const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

const VIEW_MODES = {
    CARD: 'card',
    LIST: 'list',
    TILE: 'tile',
};

export const settingsService = {
    getTheme() {
        const sessionValue = sessionStorage.getItem(THEME_KEY);
        if (sessionValue !== null) {
            return sessionValue;
        }
        return localStorage.getItem(THEME_KEY) || THEMES.SYSTEM;
    },
    setTheme(theme) {
        sessionStorage.setItem(THEME_KEY, theme);
        localStorage.setItem(THEME_KEY, theme);
    },
    getViewMode() {
        const sessionValue = sessionStorage.getItem(VIEW_KEY);
        if (sessionValue !== null) {
            return sessionValue;
        }
        return localStorage.getItem(VIEW_KEY) || VIEW_MODES.TILE;
    },
    setViewMode(viewMode) {
        sessionStorage.setItem(VIEW_KEY, viewMode);
        localStorage.setItem(VIEW_KEY, viewMode);
    },
    THEMES,
    VIEW_MODES,
};
