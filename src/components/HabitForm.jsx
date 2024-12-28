import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import { getHabit } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { IconPicker } from './IconPicker';
import * as Icons from 'lucide-react';
import { ICONS, ICON_PAIRS, searchIconForHabit } from '@/lib/iconRegistry';

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

export { ICON_PAIRS, ICONS };

export function HabitForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { createHabit, updateHabit, loading, error } = useHabits();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isHabitLoaded, setIsHabitLoaded] = useState(!id);
    const [isIconLocked, setIsIconLocked] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        icon: ICONS[0].name
    });

    useEffect(() => {
        if (id) {
            const loadHabit = async () => {
                try {
                    const habit = await getHabit(id);
                    if (habit) {
                        setFormData(habit);
                    }
                } catch (err) {
                    console.error('Failed to load habit:', err);
                } finally {
                    setIsHabitLoaded(true);
                }
            };
            loadHabit();
        } else {
            setIsHabitLoaded(true);
        }
        setIsIconLocked(false);
    }, [id]);

    useEffect(() => {
        if (formData.name && !isIconLocked) {
            const suggestedIcon = searchIconForHabit(formData.name);
            if (suggestedIcon) {
                setFormData(prev => ({ ...prev, icon: suggestedIcon }));
            }
        }
    }, [formData.name, isIconLocked]);

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

    const handleIconColorSelect = ({ icon, color }) => {
        setFormData({ ...formData, icon, color });
        setIsIconLocked(true);
    };

    const hasPairedIcon = ICON_PAIRS[formData.icon];
    const IconComponent = hasPairedIcon
        ? Icons[ICON_PAIRS[formData.icon]]
        : Icons[formData.icon];

    return (
        <div className="space-y-6">
            <div className="border-b py-4 px-4">
                <h1 className="text-xl font-semibold">
                    {id ? 'Edit Habit' : 'New Habit'}
                </h1>
            </div>

            <div className="max-w-2xl mx-auto px-4">
                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <div className="flex items-center gap-3">
                                {/* Clickable Icon */}
                                <button
                                    type="button"
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                                    onClick={() => isHabitLoaded && setIsIconPickerOpen(true)}
                                    title="Click to change icon and color"
                                    disabled={!isHabitLoaded}
                                >
                                    {IconComponent && <IconComponent className="w-7 h-7" style={{ color: formData.color }} />}
                                </button>

                                {/* Name Input */}
                                <Input
                                    id="name"
                                    className="flex-1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
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

                    {/* Icon & Color Picker Modal */}
                    <IconPicker
                        open={isIconPickerOpen}
                        onOpenChange={setIsIconPickerOpen}
                        currentIcon={formData.icon}
                        currentColor={formData.color}
                        onSelect={handleIconColorSelect}
                    />
                </Card>
            </div>
        </div>
    );
}