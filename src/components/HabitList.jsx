import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHabits } from '@/lib/hooks';
import * as Icons from 'lucide-react';
import { ICON_PAIRS } from './HabitForm';

export function HabitList() {
    const { habits, loading, error, deleteHabit } = useHabits();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b py-4 px-4">
                <h1 className="text-xl font-semibold">Manage Habits</h1>
                <Button asChild size="sm">
                    <Link to="/habits/new">New Habit</Link>
                </Button>
            </div>

            <div className="px-4 space-y-4">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {habits.map((habit) => {
                        const hasPairedIcon = ICON_PAIRS[habit.icon];
                        const IconComponent = hasPairedIcon
                            ? Icons[ICON_PAIRS[habit.icon]]
                            : Icons[habit.icon];

                        return (
                            <Card key={habit.id} className="p-4">
                                <div className="flex items-center space-x-4">
                                    {habit.icon && IconComponent && (
                                        <div
                                            className="w-8 h-8 flex items-center justify-center rounded bg-transparent"
                                        >
                                            {React.createElement(IconComponent, { className: 'w-5 h-5', style: { color: habit.color || '#838383ff' } })}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{habit.name}</h3>
                                        {habit.description && (
                                            <p className="text-sm text-muted-foreground">{habit.description}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end space-x-2">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/habits/${habit.id}`}>Edit</Link>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this habit?')) {
                                                deleteHabit(habit.id);
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {habits.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
                        <Button className="mt-4" asChild>
                            <Link to="/habits/new">Create Habit</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}