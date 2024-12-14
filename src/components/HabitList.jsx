import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHabits } from '@/lib/hooks';
import * as Icons from 'lucide-react';
import { Toolbar } from './Toolbar';

export function HabitList() {
    const { habits, loading, error, deleteHabit } = useHabits();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="space-y-6">
            <Toolbar>
                <span className="text-sm text-muted-foreground">Manage Habits</span>
                <Button asChild size="sm">
                    <Link to="/habits/new">New Habit</Link>
                </Button>
            </Toolbar>

            <div className="px-4 space-y-4">

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {habits.map((habit) => (
                        <Card key={habit.id} className="p-4">
                            <div className="flex items-center space-x-4">
                                {habit.icon && Icons[habit.icon] && (
                                    <div
                                        className="w-8 h-8 flex items-center justify-center rounded"
                                        style={{ backgroundColor: habit.color || '#e5e7eb' }}
                                    >
                                        {React.createElement(Icons[habit.icon], { className: 'w-5 h-5' })}
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
                    ))}
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