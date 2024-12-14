import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import HabitItem from './HabitItem';
import * as dateService from '@/lib/dateService';
import * as db from '@/lib/db';

export function DailyView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedDate, setSelectedDate] = useState(() => {
        const dateParam = searchParams.get('date');
        return dateParam || dateService.getTodayString();
    });
    const [scoreState, setScoreState] = useState({ completed: 0, total: 0 });

    const { habits = [], loading: habitsLoading, error: habitsError } = useHabits();

    const safeHabits = Array.isArray(habits) ? habits : [];

    useEffect(() => {
        const dateParam = searchParams.get('date');
        const initialDate = dateParam || dateService.getTodayString();
        setSelectedDate(initialDate);
        dateService.setDate(initialDate);
    }, []);

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

    useEffect(() => {
        const updateScore = () => {
            const event = new CustomEvent('scoreUpdate', {
                detail: scoreState
            });
            window.dispatchEvent(event);
        };

        const countCompletedHabits = async () => {
            let count = 0;
            for (const habit of safeHabits) {
                const isCompleted = await db.isHabitCompletedForDate(habit.id, selectedDate);
                if (isCompleted) count++;
            }
            return count;
        };

        const handleHabitToggle = async () => {
            const completed = await countCompletedHabits();
            const newScore = { completed, total: safeHabits.length };
            setScoreState(newScore);

            const event = new CustomEvent('scoreUpdate', {
                detail: newScore
            });
            window.dispatchEvent(event);
        };

        window.addEventListener('habitToggled', handleHabitToggle);
        window.addEventListener('requestScoreUpdate', updateScore);

        countCompletedHabits().then(completed => {
            setScoreState({ completed, total: safeHabits.length });
        });

        return () => {
            window.removeEventListener('habitToggled', handleHabitToggle);
            window.removeEventListener('requestScoreUpdate', updateScore);
        };
    }, [selectedDate, safeHabits]);

    if (habitsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (habitsError) {
        return <div className="text-center text-destructive p-4">Error loading habits: {habitsError}</div>;
    }

    return (
        <div className="px-4 pt-6 pb-4">
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
                            date={selectedDate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}