import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#10b981', // emerald
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#d946ef', // fuchsia
];

// We'll add icon support later with a proper icon library
const PLACEHOLDER_ICONS = ['⭐️', '🎯', '💪', '🏃‍♂️', '📚', '🎨', '🎵', '🧘‍♂️', '💭', '🌟'];

export function HabitForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createHabit, updateHabit, loading, error } = useHabits();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[0],
        icon: PLACEHOLDER_ICONS[0],
    });

    useEffect(() => {
        if (id) {
            // Load habit data if editing
            const loadHabit = async () => {
                try {
                    const habit = await getHabit(id);
                    if (habit) {
                        setFormData(habit);
                    }
                } catch (err) {
                    console.error('Failed to load habit:', err);
                }
            };
            loadHabit();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await updateHabit(id, formData);
            } else {
                await createHabit(formData);
            }
            navigate('/habits');
        } catch (err) {
            console.error('Failed to save habit:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {id ? 'Edit Habit' : 'New Habit'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-primary' : 'border-transparent'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color })}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Icon</Label>
                        <div className="flex flex-wrap gap-2">
                            {PLACEHOLDER_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    className={`w-10 h-10 rounded flex items-center justify-center text-xl border-2 ${formData.icon === icon ? 'border-primary' : 'border-muted'
                                        }`}
                                    onClick={() => setFormData({ ...formData, icon })}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/habits')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {id ? 'Update' : 'Create'} Habit
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}