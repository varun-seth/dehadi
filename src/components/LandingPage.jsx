import { Link } from 'react-router-dom';
import { ClipboardText } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

export function LandingPage() {
    const appTitle = import.meta.env.VITE_APP_TITLE;
    return (
        <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="max-w-3xl w-full space-y-12 flex flex-col items-center">
                <div className="flex flex-col md:flex-row md:items-center gap-8">
                    <div className="flex justify-center flex-shrink-0">
                        <ClipboardText className="w-32 h-32 md:w-40 md:h-40 text-primary" />
                    </div>
                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">{appTitle}</h1>
                        <p className="text-xl md:text-2xl text-muted-foreground">
                            Your Daily Habit Tracker
                        </p>
                    </div>
                </div>

                <div className="text-center space-y-4">
                    <p className="text-lg text-muted-foreground">
                        Build consistency by tracking your daily habits. Simple, focused, and designed to help you stay on track.
                        Track your progress with pace metrics that reward consistency over perfection.
                    </p>
                </div>

                <div className="flex justify-center">
                    <Button className="px-12 py-6 text-lg" size="lg" asChild>
                        <Link to="/actions">
                            Start using {appTitle}
                        </Link>
                    </Button>
                </div>

                <div className="text-center space-y-3 text-sm text-muted-foreground">
                    <p>
                        <strong>Privacy first:</strong> All your data is stored locally on your device. No account required, no cloud sync, no tracking.
                    </p>
                    <p>
                        <strong>Free forever:</strong> Open source and completely free. Install as a PWA for offline usage.
                    </p>
                    <p className="text-xs">
                        Built with ❤️ for people who want to build better habits without the complexity.
                    </p>
                </div>
            </div>
        </div>
    );
}
