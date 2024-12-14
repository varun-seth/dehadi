import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { CalendarCheck, ChevronLeftIcon, ChevronRightIcon, Settings, ListChecks } from 'lucide-react';
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from './ScoreDisplay';
import { SettingsDialog } from './SettingsDialog';
import * as dateService from '@/lib/dateService';
import { getMonthlyScores } from '@/lib/db';
import { cn } from '@/lib/utils';

/**
 * Toolbar component - STAYS MOUNTED at App level
 * Uses date service for state management - no props from children
 */
export function Toolbar() {
    const location = useLocation();
    const dateTextRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [monthlyScores, setMonthlyScores] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

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

    const loadMonthlyScores = async (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const scores = await getMonthlyScores(year, month);
        setMonthlyScores(scores);
    };

    const handleMonthChange = (newMonth) => {
        setCurrentMonth(newMonth);
        loadMonthlyScores(newMonth);
    };

    useEffect(() => {
        if (isDialogOpen) {
            loadMonthlyScores(currentMonth);
        }
    }, [isDialogOpen]);

    const CustomDayContent = ({ day, modifiers }) => {
        const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;
        const score = monthlyScores[dateStr] || 0;

        const radius = 6;
        const strokeWidth = 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (score / 100) * circumference;

        return (
            <>
                <span>{day.date.getDate()}</span>
                <svg width="16" height="16" className="transform -rotate-90">
                    <circle
                        cx="8"
                        cy="8"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        className="opacity-20"
                    />
                    <circle
                        cx="8"
                        cy="8"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                    />
                </svg>
            </>
        );
    };

    return (
        <header className="flex-shrink-0 z-50 bg-background flex items-center justify-between border-b py-2 px-4">
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
                            <DialogContent className="[&>button]:hidden max-w-fit p-4">
                                <Calendar
                                    mode="single"
                                    selected={new Date(dateService.getCurrentDate() + 'T00:00:00')}
                                    onSelect={handleDateSelect}
                                    month={currentMonth}
                                    onMonthChange={handleMonthChange}
                                    components={{
                                        DayButton: ({ day, modifiers, ...props }) => (
                                            <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                                                <CustomDayContent day={day} />
                                            </CalendarDayButton>
                                        )
                                    }}
                                />
                                <div className="flex items-center justify-center gap-4 pt-4 border-t">
                                    <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </Button>
                                    <ScoreDisplay size={48} showText={true} />
                                    <Button variant="ghost" size="icon" onClick={handleNextDay}>
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
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
                                <ListChecks className="h-4 w-4" />
                                <span className="absolute -bottom-8 right-0 scale-0 transition-all group-hover:scale-100 rounded bg-secondary px-2 py-1 text-xs">
                                    Manage habits
                                </span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSettingsOpen(true)}
                            className="group relative"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="absolute -bottom-8 right-0 scale-0 transition-all group-hover:scale-100 rounded bg-secondary px-2 py-1 text-xs">
                                Settings
                            </span>
                        </Button>
                    </div>
                </>
            )}
            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        </header>
    );
}
