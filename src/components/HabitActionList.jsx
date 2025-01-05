import React, { useState, useEffect } from 'react';
import { isHabitDueOnDate } from '@/lib/cycle';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import HabitActionItem from './HabitActionItem';
import { HabitFormDialog } from './HabitFormDialog';
import { Button } from '@/components/ui/button';
import * as dateService from '@/lib/date';
import * as db from '@/lib/db';

export function HabitActionList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(() => {
        const dateParam = searchParams.get('date');
        return dateParam || dateService.getTodayString();
    });
    const [scoreState, setScoreState] = useState({ completed: 0, total: 0 });
    const [isCreateHabitOpen, setIsCreateHabitOpen] = useState(false);
    const [habitCompletions, setHabitCompletions] = useState({});

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
        const habitsForDate = safeHabits.filter(habit => isHabitDueOnDate(habit, selectedDate));

        const countCompletedHabits = async () => {
            let count = 0;
            const completions = {};
            for (const habit of habitsForDate) {
                const isCompleted = await db.isHabitCompletedForDate(habit.id, selectedDate);
                completions[habit.id] = isCompleted;
                if (isCompleted) count++;
            }
            setHabitCompletions(completions);
            return count;
        };

        const updateScoreDisplay = (completed, total) => {
            const newScore = { completed, total };
            setScoreState(newScore);
            const event = new CustomEvent('scoreUpdate', {
                detail: newScore
            });
            window.dispatchEvent(event);
        };

        const handleHabitToggle = async () => {
            const completed = await countCompletedHabits();
            updateScoreDisplay(completed, habitsForDate.length);
        };

        const handleRequestScoreUpdate = async () => {
            const completed = await countCompletedHabits();
            updateScoreDisplay(completed, habitsForDate.length);
        };

        window.addEventListener('habitToggled', handleHabitToggle);
        window.addEventListener('requestScoreUpdate', handleRequestScoreUpdate);

        countCompletedHabits().then(completed => {
            updateScoreDisplay(completed, habitsForDate.length);
        });

        return () => {
            window.removeEventListener('habitToggled', handleHabitToggle);
            window.removeEventListener('requestScoreUpdate', handleRequestScoreUpdate);
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

    // Only show habits due on selectedDate
    const habitsForDate = safeHabits.filter(habit => isHabitDueOnDate(habit, selectedDate));
    const sortedHabits = [...habitsForDate].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));

    const handleHabitCreated = () => {
        setIsCreateHabitOpen(false);
    };

    return (
        <div className="px-4 pt-6 pb-4">
            {safeHabits.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        No habits planned for today
                    </p>
                    <Button onClick={() => setIsCreateHabitOpen(true)}>
                        Create Habit
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col">
                    {sortedHabits.map((habit, index) => {
                        const isCurrentCompleted = habitCompletions[habit.id] || false;
                        const isPrevCompleted = index > 0 ? (habitCompletions[sortedHabits[index - 1].id] || false) : false;
                        const isNextCompleted = index < sortedHabits.length - 1 ? (habitCompletions[sortedHabits[index + 1].id] || false) : false;

                        return (
                            <div key={habit.id}>
                                <HabitActionItem
                                    habit={habit}
                                    date={selectedDate}
                                    isPrevCompleted={isPrevCompleted}
                                    isNextCompleted={isNextCompleted}
                                />
                                {index < sortedHabits.length - 1 && (
                                    <div className="border-b border-border mx-2" />
                                )
                                }
                            </div>
                        );
                    })}
                </div>
            )}
            <HabitFormDialog
                open={isCreateHabitOpen}
                onOpenChange={setIsCreateHabitOpen}
                onSuccess={handleHabitCreated}
            />
        </div>
    );
}