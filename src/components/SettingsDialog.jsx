
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Wrench, Database, SquaresFour, List, GridNine } from '@phosphor-icons/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { settingsService } from '@/lib/settings';


export function SettingsDialog({ open, onOpenChange }) {
    const appVersion = import.meta.env.VITE_APP_VERSION;
    const appTitle = import.meta.env.VITE_APP_TITLE;
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => settingsService.getTheme());
    const [habitView, setHabitView] = useState(() => settingsService.getViewMode());
    const handleViewChange = (newView) => {
        setHabitView(newView);
        settingsService.setViewMode(newView);
        window.dispatchEvent(new CustomEvent('habitViewChange', { detail: { view: newView } }));
    };

    useEffect(() => {
        const applyTheme = (selectedTheme) => {
            const root = document.documentElement;
            if (selectedTheme === settingsService.THEMES.SYSTEM) {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? settingsService.THEMES.DARK
                    : settingsService.THEMES.LIGHT;
                root.classList.toggle('dark', systemTheme === settingsService.THEMES.DARK);
            } else {
                root.classList.toggle('dark', selectedTheme === settingsService.THEMES.DARK);
            }
        };

        applyTheme(theme);
        settingsService.setTheme(theme);

        if (theme === settingsService.THEMES.SYSTEM) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => applyTheme(theme);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };

    const handleNavigateToHabits = () => {
        onOpenChange(false);
        navigate('/habits');
    };

    const handleNavigateToData = () => {
        onOpenChange(false);
        navigate('/data');
    };

    const handleNavigateToLanding = () => {
        onOpenChange(false);
        window.location.href = '/';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            variant="outline"
                            className="flex flex-col gap-3 h-auto py-6"
                            onClick={handleNavigateToHabits}
                        >
                            <Wrench className="h-8 w-8" />
                            <span className="text-sm font-medium">Edit Habits</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex flex-col gap-3 h-auto py-6"
                            onClick={handleNavigateToData}
                        >
                            <Database className="h-8 w-8" />
                            <span className="text-sm font-medium">Manage Data</span>
                        </Button>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-3">Theme</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={theme === settingsService.THEMES.LIGHT ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(settingsService.THEMES.LIGHT)}
                            >
                                <Sun className="h-5 w-5" />
                                <span className="text-xs">Light</span>
                            </Button>
                            <Button
                                variant={theme === settingsService.THEMES.SYSTEM ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(settingsService.THEMES.SYSTEM)}
                            >
                                <Monitor className="h-5 w-5" />
                                <span className="text-xs">System</span>
                            </Button>
                            <Button
                                variant={theme === settingsService.THEMES.DARK ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleThemeChange(settingsService.THEMES.DARK)}
                            >
                                <Moon className="h-5 w-5" />
                                <span className="text-xs">Dark</span>
                            </Button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium mb-3">Actions View</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <Button
                                variant={habitView === settingsService.VIEW_MODES.CARD ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleViewChange(settingsService.VIEW_MODES.CARD)}
                            >
                                <SquaresFour className="h-5 w-5" />
                                <span className="text-xs">Card</span>
                            </Button>
                            <Button
                                variant={habitView === settingsService.VIEW_MODES.TILE ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleViewChange(settingsService.VIEW_MODES.TILE)}
                            >
                                <GridNine className="h-5 w-5" />
                                <span className="text-xs">Tile</span>
                            </Button>
                            <Button
                                variant={habitView === settingsService.VIEW_MODES.LIST ? "default" : "outline"}
                                className="flex flex-col gap-2 h-auto py-3"
                                onClick={() => handleViewChange(settingsService.VIEW_MODES.LIST)}
                            >
                                <List className="h-5 w-5" />
                                <span className="text-xs">List</span>
                            </Button>
                        </div>
                    </div>
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <span>{appTitle} is a habit tracking app</span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-sm"
                                onClick={handleNavigateToLanding}
                            >
                                home page
                            </Button>
                        </div>
                        <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
                            <span>Version: {appVersion}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
