import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ClipboardText, CaretLeft, CaretRight, Gear, Wrench, Plus, List, Rows, Database } from '@phosphor-icons/react';
import { HabitFormDialog } from './HabitFormDialog';
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from './ScoreDisplay';
import { SettingsDialog } from './SettingsDialog';
import * as dateService from '@/lib/date';
import { getMonthlyScores } from '@/lib/db';
import { emit, subscribe, REORDER_MODE_TOGGLED_EVENT } from '@/lib/bus';
import { cn } from '@/lib/utils';


function BackButton({ onClick, className }) {
    return (
        <Button
            variant="ghost"
            className={cn("h-9 w-9 p-0 sm:h-9 sm:px-4 sm:py-2 sm:w-auto", className)}
            onClick={onClick}
        >
            <CaretLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
        </Button>
    );
}

/**
 * Toolbar component - STAYS MOUNTED at App level
 * Uses date service for state management - no props from children
 */
export function Toolbar() {
    const appTitle = import.meta.env.VITE_APP_TITLE;
    const location = useLocation();
    const navigate = useNavigate();
    const dateTextRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
    const [isReorderMode, setIsReorderMode] = useState(false);
    const [monthlyScores, setMonthlyScores] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const isLandingPage = location.pathname === '/';
    const isDailyView = location.pathname === '/actions';
    const isHabitsView = location.pathname === '/habits';
    const isHabitDetailView = location.pathname.startsWith('/habits/') && location.pathname !== '/habits/';
    const isDataView = location.pathname === '/data';
    const habitId = isHabitDetailView ? location.pathname.split('/habits/')[1] : null;

    const handleHabitCreated = () => {
        setIsCreateHabitOpen(false);
        navigate('/habits');
    };

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

    useEffect(() => {
        // Listen for reorder mode changes
        const unsubscribe = subscribe(REORDER_MODE_TOGGLED_EVENT, () => {
            setIsReorderMode(prev => !prev);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        // Reset reorder mode when entering habits view (always start in detailed mode)
        if (isHabitsView) {
            setIsReorderMode(false);
        }
    }, [isHabitsView]);

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

    if (isLandingPage) {
        return null;
    }

    return (
        <header className="flex-shrink-0 z-50 bg-background flex items-center justify-between border-b py-2 px-4">
            {!isHabitDetailView && !isHabitsView && !isDataView && (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        className="h-9 w-9 p-0 sm:h-9 sm:px-4 sm:py-2 sm:w-auto"
                        asChild
                    >
                        <Link to="/actions" onClick={handleHomeClick}>
                            <ClipboardText className="h-4 w-4" />
                            <span className="hidden sm:inline">{appTitle}</span>
                        </Link>
                    </Button>
                </div>
            )}
            {isHabitDetailView && (
                <Button variant="ghost" onClick={() => navigate('/habits')}>
                    <CaretLeft className="h-4 w-4 mr-2" />
                    All Habits
                </Button>
            )}
            {isDataView && (
                <div className="flex items-center gap-2">
                    <BackButton onClick={() => navigate('/actions')} />
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                    >
                        <Database className="h-4 w-4" />
                        <span>Manage Data</span>
                    </Button>
                </div>
            )}
            {isDailyView && (
                <>
                    <div className="flex items-center space-x-2 absolute left-1/2 -translate-x-1/2">
                        <Button variant="ghost" size="icon" onClick={handlePreviousDay}>
                            <CaretLeft className="h-4 w-4" />
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="font-medium">
                                    <span ref={dateTextRef}>Today</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="[&>button]:hidden max-w-fit p-4">
                                <DialogTitle className="sr-only">Select Date</DialogTitle>
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
                                        <CaretLeft className="h-4 w-4" />
                                    </Button>
                                    <ScoreDisplay size={48} showText={true} />
                                    <Button variant="ghost" size="icon" onClick={handleNextDay}>
                                        <CaretRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={handleNextDay}>
                            <CaretRight className="h-4 w-4" />
                        </Button>
                    </div>
                </>
            )}
            {isHabitsView && (
                <>
                    <div className="flex items-center gap-2">
                        <BackButton onClick={() => navigate('/actions')} />
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            <Wrench className="h-4 w-4" />
                            Habits
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => emit(REORDER_MODE_TOGGLED_EVENT)}>
                            {isReorderMode ? <Rows className="h-4 w-4 mr-1" /> : <List className="h-4 w-4 mr-1" />}
                            {isReorderMode ? 'Detailed View' : 'Reorder'}
                        </Button>
                    </div>
                </>
            )}
            {isHabitDetailView && (
                <Button variant="ghost" onClick={() => navigate('/habits')}>
                    <CaretLeft className="h-4 w-4 mr-2" />
                    All Habits
                </Button>
            )}

            {/* Settings button - always visible in right corner */}
            <div className="flex items-center gap-2">
                {isHabitsView && (
                    <Button size="sm" onClick={() => setIsCreateHabitOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Habit
                    </Button>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSettingsOpen(true)}
                            >
                                <Gear className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Settings</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            <HabitFormDialog
                open={isCreateHabitOpen}
                onOpenChange={setIsCreateHabitOpen}
                onSuccess={handleHabitCreated}
            />
        </header>
    );
}
