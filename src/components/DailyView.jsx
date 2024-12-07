import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, Settings } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useHabits, useHabitActions } from '@/lib/hooks';

import HabitItem from './HabitItem';

/**
 * Formats a date string (YYYY-MM-DD) to a human-readable format
 */
const formatDate = (dateString) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
};

/**
 * Formats today's date as YYYY-MM-DD
 */
const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Add or subtract days from a date string (YYYY-MM-DD)
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {number} days - Number of days to add (positive) or subtract (negative)
 * @returns {string} New date in YYYY-MM-DD format
 */
const addDays = (dateString, days) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    return `${newYear}-${newMonth}-${newDay}`;
};

export function DailyView() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Get selected date from URL query parameter, default to today
    const selectedDate = useMemo(() => {
        return searchParams.get('date') || getTodayString();
    }, [searchParams]);

    const { habits = [], loading: habitsLoading, error: habitsError } = useHabits();
    const { actions = [], toggleHabit, loading: actionsLoading, error: actionsError } = useHabitActions(selectedDate);

    // Memoize the completion check for performance
    const completedHabitsSet = React.useMemo(() => {
        return new Set(actions.map(action => action[0]));
    }, [actions]);

    const isHabitCompleted = React.useCallback((habitId) => {
        return completedHabitsSet.has(habitId);
    }, [completedHabitsSet]);

    // Handle loading and error states
    if (habitsLoading || actionsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (habitsError) return <div className="text-center text-destructive p-4">Error loading habits: {habitsError}</div>;
    if (actionsError) return <div className="text-center text-destructive p-4">Error loading actions: {actionsError}</div>;

    // Ensure habits is always an array
    const safeHabits = Array.isArray(habits) ? habits : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b py-2 px-4">
                <Button
                    variant="ghost"
                    className="text-lg font-semibold hover:bg-transparent p-0 h-auto"
                    onClick={() => setSearchParams({})}
                >
                    Dehadi
                </Button>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSearchParams({ date: addDays(selectedDate, -1) });
                        }}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="font-medium">
                                {formatDate(selectedDate)}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="[&>button]:hidden">
                            <Calendar
                                mode="single"
                                selected={new Date(selectedDate + 'T00:00:00')}
                                onSelect={(date) => {
                                    if (date) {
                                        const year = date.getFullYear();
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const dateString = `${year}-${month}-${day}`;
                                        setSearchParams({ date: dateString });
                                    }
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSearchParams({ date: addDays(selectedDate, 1) });
                        }}
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
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
                </div>
            </div>

            <div className="px-4">
                {safeHabits.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No habits created yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {safeHabits.map((habit) => (
                            <HabitItem
                                key={habit.id}
                                habit={habit}
                                isCompleted={isHabitCompleted(habit.id)}
                                onToggle={toggleHabit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}