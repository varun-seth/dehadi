import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHabits, useHabitActions } from '@/lib/hooks';
import HabitItem from './HabitItem';
import * as dateService from '@/lib/dateService';

export function DailyView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedDate, setSelectedDate] = useState(() => {
        const dateParam = searchParams.get('date');
        return dateParam || dateService.getTodayString();
    });

    const { habits = [], loading: habitsLoading, error: habitsError } = useHabits();
    const { actions = [], toggleHabit, loading: actionsLoading, error: actionsError } = useHabitActions(selectedDate);

    // Ensure habits is always an array
    const safeHabits = Array.isArray(habits) ? habits : [];

    // Initialize date from URL on mount
    useEffect(() => {
        const dateParam = searchParams.get('date');
        const initialDate = dateParam || dateService.getTodayString();
        setSelectedDate(initialDate);
        dateService.setDate(initialDate);
    }, []);

    // Listen for date changes from the date service and update URL
    useEffect(() => {
        const unsubscribe = dateService.onDateChange(({ date }) => {
            setSelectedDate(date);
            const todayString = dateService.getTodayString();
            if (date === todayString) {
                setSearchParams({});
            } else {
                setSearchParams({ date });
            }
        });

        return unsubscribe;
    }, [setSearchParams]);

    // Memoize the completion check for performance
    const completedHabitsSet = React.useMemo(() => {
        return new Set(actions.map(action => action[0]));
    }, [actions]);

    const isHabitCompleted = React.useCallback((habitId) => {
        return completedHabitsSet.has(habitId);
    }, [completedHabitsSet]);

    // Send score updates via event - doesn't cause re-renders
    React.useEffect(() => {
        const event = new CustomEvent('scoreUpdate', {
            detail: { completed: actions.length, total: safeHabits.length }
        });
        window.dispatchEvent(event);

        // Also listen for initial update requests
        const handleRequest = () => {
            const event = new CustomEvent('scoreUpdate', {
                detail: { completed: actions.length, total: safeHabits.length }
            });
            window.dispatchEvent(event);
        };

        window.addEventListener('requestScoreUpdate', handleRequest);
        return () => window.removeEventListener('requestScoreUpdate', handleRequest);
    }, [actions.length, safeHabits.length]);

    // Handle loading and error states
    if (habitsLoading || actionsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (habitsError) {
        return <div className="text-center text-destructive p-4">Error loading habits: {habitsError}</div>;
    }

    if (actionsError) {
        return <div className="text-center text-destructive p-4">Error loading actions: {actionsError}</div>;
    }

    return (
        <div className="px-4 pt-6">
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
    );
}