import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ClipboardCheck, ChevronLeftIcon, ChevronRightIcon, Settings, PencilRuler, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
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
    const navigate = useNavigate();
    const dateTextRef = useRef(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
    const [monthlyScores, setMonthlyScores] = useState({});
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const isLandingPage = location.pathname === '/';
    const isDailyView = location.pathname === '/actions';
    const isHabitsView = location.pathname === '/habits';
    const isHabitDetailView = location.pathname.startsWith('/habits/') && location.pathname !== '/habits/';
    const isDataView = location.pathname === '/data';
    const habitId = isHabitDetailView ? location.pathname.split('/habits/')[1] : null;

    const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
    const [isDeleteHabitOpen, setIsDeleteHabitOpen] = useState(false);

    const handleHabitCreated = (newHabitId) => {
        setIsCreateHabitOpen(false);
        navigate(`/habits/${newHabitId}`);
    };

    const handleEditSuccess = () => {
        setIsEditHabitOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            const { deleteHabit } = await import('@/lib/db');
            await deleteHabit(habitId);
            setIsDeleteHabitOpen(false);
            navigate('/habits');
        } catch (err) {
            console.error('Failed to delete habit:', err);
        }
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
                        className="text-lg font-semibold hover:bg-transparent p-0 h-auto flex items-center gap-2"
                        asChild
                    >
                        <Link to="/actions" onClick={handleHomeClick}>
                            <ClipboardCheck className="w-5 h-5" />
                            <span className="hidden sm:inline">Dihadi</span>
                        </Link>
                    </Button>
                </div>
            )}
            {isHabitDetailView && (
                <Button variant="ghost" onClick={() => navigate('/habits')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    All Habits
                </Button>
            )}
            {isDataView && (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => navigate('/actions')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                    >
                        <span>Manage Data</span>
                    </Button>
                </div>
            )}
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
            {isHabitsView && (
                <>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => navigate('/actions')}>
                            <ChevronLeftIcon className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            <PencilRuler className="h-4 w-4" />
                            Habits
                        </Button>
                    </div>
                    <Button size="sm" onClick={() => setIsCreateHabitOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" />
                        New Habit
                    </Button>
                </>
            )}
            {isHabitDetailView && (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditHabitOpen(true)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteHabitOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )}
            <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
            <HabitFormDialog
                open={isCreateHabitOpen}
                onOpenChange={setIsCreateHabitOpen}
                onSuccess={handleHabitCreated}
            />
            <HabitFormDialog
                open={isEditHabitOpen}
                onOpenChange={setIsEditHabitOpen}
                habitId={habitId}
                onSuccess={handleEditSuccess}
            />
            <Dialog open={isDeleteHabitOpen} onOpenChange={setIsDeleteHabitOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Habit</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this habit? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteHabitOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </header>
    );
}
