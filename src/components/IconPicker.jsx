import { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ICONS, ICON_PAIRS } from '@/lib/iconRegistry';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Search } from 'lucide-react';

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

export function IconPicker({ open, onOpenChange, currentIcon, currentColor, onSelect }) {
    const [selectedIcon, setSelectedIcon] = useState(currentIcon);
    const [selectedColor, setSelectedColor] = useState(currentColor);

    useEffect(() => {
        setSelectedIcon(currentIcon);
    }, [currentIcon]);

    useEffect(() => {
        setSelectedColor(currentColor);
    }, [currentColor]);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredIcons = useMemo(() => {
        if (!searchQuery.trim()) {
            return ICONS;
        }

        const searchTerm = searchQuery.toLowerCase().trim();

        const exactMatches = ICONS.filter(icon =>
            icon.tags.some(tag => tag.toLowerCase() === searchTerm)
        );

        if (exactMatches.length > 0) {
            return exactMatches;
        }

        const partialMatches = ICONS.filter(icon =>
            icon.name.toLowerCase().includes(searchTerm) ||
            icon.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );

        return partialMatches;
    }, [searchQuery]);

    const handleApply = () => {
        onSelect({ icon: selectedIcon, color: selectedColor });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Customize Habit Appearance</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Color Selection */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Color</h3>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn(
                                        "w-10 h-10 rounded-full border-2 transition-all",
                                        selectedColor === color
                                            ? 'ring-2 ring-foreground scale-110'
                                            : 'border-background hover:scale-105'
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Icon</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search icons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="grid grid-cols-10 gap-2 max-h-[300px] overflow-y-auto pr-5">
                            {filteredIcons.length === 0 ? (
                                <div className="col-span-10 text-center text-muted-foreground py-8">
                                    No icons found
                                </div>
                            ) : (
                                filteredIcons.map(({ name, component: Icon }) => {
                                    const DisplayIcon = ICON_PAIRS[name]
                                        ? Icons[ICON_PAIRS[name]]
                                        : Icon;

                                    return (
                                        <button
                                            key={name}
                                            type="button"
                                            className={cn(
                                                "w-full aspect-square rounded flex items-center justify-center p-1.5",
                                                "border-2",
                                                selectedIcon === name
                                                    ? "border-primary"
                                                    : "border-muted",
                                                "hover:bg-accent"
                                            )}
                                            onClick={() => setSelectedIcon(name)}
                                            title={name}
                                        >
                                            <DisplayIcon className="w-5 h-5" />
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleApply}>
                        Apply
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
