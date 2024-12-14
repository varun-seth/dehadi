import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const THEME_KEY = 'dihadi-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export function SettingsDialog({ open, onOpenChange }) {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem(THEME_KEY) || THEMES.SYSTEM;
    });

    useEffect(() => {
        const applyTheme = (selectedTheme) => {
            const root = document.documentElement;

            if (selectedTheme === THEMES.SYSTEM) {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? THEMES.DARK
                    : THEMES.LIGHT;
                root.classList.toggle('dark', systemTheme === THEMES.DARK);
            } else {
                root.classList.toggle('dark', selectedTheme === THEMES.DARK);
            }
        };

        applyTheme(theme);
        localStorage.setItem(THEME_KEY, theme);

        if (theme === THEMES.SYSTEM) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme(theme);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <h3 className="text-sm font-medium mb-3">Theme</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === THEMES.LIGHT ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(THEMES.LIGHT)}
                            >
                                <Sun className="h-5 w-5" />
                                <span className="text-xs">Light</span>
                            </Button>
                            <Button
                                variant={theme === THEMES.DARK ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(THEMES.DARK)}
                            >
                                <Moon className="h-5 w-5" />
                                <span className="text-xs">Dark</span>
                            </Button>
                            <Button
                                variant={theme === THEMES.SYSTEM ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(THEMES.SYSTEM)}
                            >
                                <Monitor className="h-5 w-5" />
                                <span className="text-xs">System</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
