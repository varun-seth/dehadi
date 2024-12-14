import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CalendarCheck, ChevronLeftIcon, ChevronRightIcon, Settings } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from './ScoreDisplay';
import * as dateService from '@/lib/dateService';

/**
 * Toolbar component - STAYS MOUNTED at App level
 * Uses date service for state management - no props from children
 */
export function Toolbar() {
    const location = useLocation();
    const dateTextRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const isDailyView = location.pathname === '/';

    useEffect(() => {
        // Listen for date changes
        const unsubscribe = dateService.onDateChange(({ formatted }) => {
            if (dateTextRef.current) {
                dateTextRef.current.textContent = formatted;
            }
        });

        // Request initial date
        setTimeout(() => dateService.requestCurrentDate(), 0);

        return unsubscribe;
    }, []);

    const handlePreviousDay = () => {
        dateService.previousDay();
    };

    const handleNextDay = () => {
        dateService.nextDay();
    };

    const handleDateSelect = (date) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            dateService.setDate(dateString);
            setIsDialogOpen(false);
        }
    };

    const handleHomeClick = () => {
        dateService.setDate(dateService.getTodayString());
    };

    return (
        <div className="sticky top-0 z-50 bg-background flex items-center justify-between border-b py-2 px-4">
            <Button
                variant="ghost"
                className="text-lg font-semibold hover:bg-transparent p-0 h-auto flex items-center gap-2"
                asChild
            >
                <Link to="/" onClick={handleHomeClick}>
                    <CalendarCheck className="w-5 h-5" />
                    Dihadi
                </Link>
            </Button>
            {isDailyView && (
                <>
                    <div className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
                        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                            <ChevronLeftIcon className="h-4 w-4" />
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="font-medium">
                                    <span ref={dateTextRef}>Today</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="[&>button]:hidden max-w-fit p-0">
                                <Calendar
                                    mode="single"
                                    selected={new Date(dateService.getCurrentDate() + 'T00:00:00')}
                                    onSelect={handleDateSelect}
                                />
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={handleNextDay}>
                            <ChevronRightIcon className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="group relative"
                        >
                            <Link to="/habits">
                                <Settings className="h-4 w-4" />
                                <span className="absolute -bottom-8 right-0 scale-0 transition-all group-hover:scale-100 rounded bg-secondary px-2 py-1 text-xs">
                                    Manage habits
                                </span>
                            </Link>
                        </Button>
                        <ScoreDisplay />
                    </div>
                </>
            )}
        </div>
    );
}
