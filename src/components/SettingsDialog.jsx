import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, PencilRuler, Home, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { exportAllData } from '@/lib/db';

const THEME_KEY = 'dihadi-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
};

export function SettingsDialog({ open, onOpenChange }) {
    const navigate = useNavigate();
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

    const handleNavigateToHabits = () => {
        onOpenChange(false);
        navigate('/habits');
    };

    const handleNavigateToLanding = () => {
        onOpenChange(false);
        window.location.href = '/';
    };

    const handleExportData = async () => {
        try {
            const data = await exportAllData();

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            link.download = `dihadi-export-${timestamp}.json`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div>
                        <Button
                            variant="outline"
                            className="w-full flex flex-col gap-3 h-auto py-6"
                            onClick={handleNavigateToHabits}
                        >
                            <PencilRuler className="h-8 w-8" />
                            <span className="text-sm font-medium">Manage Habits</span>
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant="outline"
                            className="w-full flex flex-col gap-3 h-auto py-6"
                            onClick={handleExportData}
                        >
                            <Download className="h-8 w-8" />
                            <span className="text-sm font-medium">Export Data</span>
                        </Button>
                    </div>
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
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <span>Dihadi is a habit tracking app</span>
                            <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-sm"
                                onClick={handleNavigateToLanding}
                            >
                                home page
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
