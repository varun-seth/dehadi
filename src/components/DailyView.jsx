import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabits, useHabitActions } from '@/lib/hooks';

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export function DailyView() {
    const [date] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    });

    const { habits = [], loading: habitsLoading, error: habitsError } = useHabits();
    const { actions = [], toggleHabit, loading: actionsLoading, error: actionsError } = useHabitActions(date);

    if (habitsError) return <div>Error loading habits: {habitsError}</div>;
    if (actionsError) return <div>Error loading actions: {actionsError}</div>;
    if (habitsLoading || actionsLoading) return <div>Loading...</div>;

    // Ensure habits is always an array
    const safeHabits = Array.isArray(habits) ? habits : [];

    if (habitsLoading || actionsLoading) return <div>Loading...</div>;

    const isHabitCompleted = (habitId) => {
        return actions.some(action =>
            action[0] === habitId && action[1].startsWith(date)
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{formatDate(new Date(date))}</h1>
                <div className="text-2xl">
                    {/* Add navigation buttons later */}
                </div>
            </div>

            <Card className="p-6">
                {safeHabits.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No habits created yet. Start by creating your first habit!
                        </p>
                        <Button asChild>
                            <Link to="/habits/new">Create Habit</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {safeHabits.map((habit) => (
                            <div
                                key={habit.id}
                                className="flex items-center space-x-4 p-2 rounded hover:bg-accent/50"
                            >
                                <Checkbox
                                    checked={isHabitCompleted(habit.id)}
                                    onCheckedChange={() => toggleHabit(habit.id)}
                                    id={`habit-${habit.id}`}
                                />
                                <div className="flex items-center space-x-4 flex-1">
                                    {habit.icon && (
                                        <div
                                            className="w-8 h-8 flex items-center justify-center rounded"
                                            style={{ backgroundColor: habit.color || '#e5e7eb' }}
                                        >
                                            {habit.icon}
                                        </div>
                                    )}
                                    <label
                                        htmlFor={`habit-${habit.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {habit.name}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}