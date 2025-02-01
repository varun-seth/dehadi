import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '@/lib/hooks';
import { getHabit } from '@/lib/db';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CycleConfig } from "./CycleConfig";
import { getDefaultCycle, CycleUnit } from '@/lib/cycle';
import { emit, HABIT_UPDATED_EVENT } from '@/lib/bus';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { IconPicker } from './IconPicker';
import { Icons } from '@/lib/iconsSubset.jsx';
import { USER_ICONS, searchIconForHabit, ICON_SLUG_TO_NAME, getInitialColor } from '@/lib/iconRegistry';


export function HabitFormDialog({ open, onOpenChange, habitId = null, onSuccess }) {
    const { createHabit, updateHabit, loading } = useHabits();
    const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
    const [isIconLocked, setIsIconLocked] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: getInitialColor(),
        icon: USER_ICONS.length > 0 ? USER_ICONS[0].slug : '',
        cycle: {
            unit: 'day',
            slots: null,
            rest: 0,
            phase: 0
        }
    });

    useEffect(() => {
        if (open) {
            if (habitId) {
                const loadHabit = async () => {
                    try {
                        const habit = await getHabit(habitId);
                        if (habit) {
                            setFormData({
                                ...habit,
                                cycle: habit.cycle || {
                                    unit: 'day',
                                    slots: null,
                                    rest: 0,
                                    phase: 0
                                }
                            });
                            setIsIconLocked(true);
                        }
                    } catch (err) {
                        console.error('Failed to load habit:', err);
                    }
                };
                loadHabit();
            } else {
                setFormData({
                    name: '',
                    description: '',
                    color: getInitialColor(),
                    icon: USER_ICONS.length > 0 ? USER_ICONS[0].slug : '',
                    cycle: null
                });
                setIsIconLocked(false);
            }
        }
    }, [open, habitId]);

    useEffect(() => {
        if (formData.name && !isIconLocked && open) {
            const suggestedIconName = searchIconForHabit(formData.name);
            const suggestedIconObj = USER_ICONS.find(icon => icon.name === suggestedIconName);
            if (suggestedIconObj) {
                setFormData(prev => ({ ...prev, icon: suggestedIconObj.slug }));
            }
        }
    }, [formData.name, isIconLocked, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (habitId) {
                const updatedHabit = await updateHabit(habitId, formData);
                emit(HABIT_UPDATED_EVENT, { id: habitId, habit: updatedHabit });
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const newHabit = await createHabit(formData);
                emit(HABIT_UPDATED_EVENT, { id: newHabit.id, habit: newHabit });
                onOpenChange(false);
                if (onSuccess) {
                    onSuccess(newHabit.id);
                }
                return;
            }
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save habit:', err);
        }
    };

    const handleIconColorSelect = ({ icon, color }) => {
        // icon here is either name or slug, so find slug if needed
        let iconObj = USER_ICONS.find(i => i.name === icon || i.slug === icon);
        setFormData({ ...formData, icon: iconObj ? iconObj.slug : icon, color });
        setIsIconLocked(true);
    };

    // Find the icon by slug, then get its name for the component
    // Convert habit.icon (slug) to iconName using dictionary
    const iconName = ICON_SLUG_TO_NAME[formData.icon];
    const IconComponent = iconName ? Icons[iconName] : null;
    // ...existing code...

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {habitId ? 'Edit Habit' : 'New Habit'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                                    onClick={() => setIsIconPickerOpen(true)}
                                    title="Click to change icon and color"
                                >
                                    {IconComponent && <IconComponent className="w-7 h-7" style={{ color: formData.color }} />}
                                </button>

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

                        <hr className="my-6" />
                        <CycleConfig
                            cycle={formData.cycle ?? getDefaultCycle()}
                            setCycle={cycle => setFormData({ ...formData, cycle })}
                            editable={true}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <IconPicker
                open={isIconPickerOpen}
                onOpenChange={setIsIconPickerOpen}
                currentIcon={formData.icon}
                currentColor={formData.color}
                onSelect={handleIconColorSelect}
            />
        </>
    );
}
