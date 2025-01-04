

import React, { useState, useMemo } from 'react';
import { CycleUnit, findNextDueDate } from '@/lib/cycle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select.jsx';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';



export function CycleConfig({ cycle, setCycle, editable = true }) {
    if (!cycle) return null;


    return (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-md">
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    <Label htmlFor="cycle-unit" className="min-w-[48px]">Repeat every</Label>
                    <Select
                        value={cycle.unit}
                        onValueChange={val => editable && setCycle({ ...cycle, unit: val, slots: null })}
                        disabled={!editable}
                    >
                        <SelectItem value={CycleUnit.DAY}>Day</SelectItem>
                        <SelectItem value={CycleUnit.WEEK}>Week</SelectItem>
                        <SelectItem value={CycleUnit.MONTH}>Month</SelectItem>
                    </Select>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                        </TooltipTrigger>
                        <TooltipContent>This sets the scale of the cycle. The cycle restarts at the end of this period.</TooltipContent>
                    </Tooltip>
                </div>


                {cycle.unit === 'week' && (
                    <div className="flex items-center gap-2">
                        <Label className="min-w-[48px]">Days</Label>
                        <div className="flex gap-1 flex-wrap">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
                                <Button
                                    type="button"
                                    key={day}
                                    variant={cycle.slots?.includes(idx) ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => {
                                        if (!editable) return;
                                        const slots = cycle.slots || [];
                                        setCycle({
                                            ...cycle,
                                            slots: slots.includes(idx)
                                                ? slots.filter(d => d !== idx)
                                                : [...slots, idx]
                                        });
                                    }}
                                    disabled={!editable}
                                    className="px-2"
                                >{day}</Button>
                            ))}
                        </div>
                    </div>
                )}
                {cycle.unit === 'month' && (
                    <div className="flex items-center gap-2">
                        <Label className="min-w-[48px]">Dates</Label>
                        <Input
                            type="text"
                            value={cycle.slots ? cycle.slots.join(',') : ''}
                            onChange={e => editable && setCycle({
                                ...cycle,
                                slots: e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                            })}
                            placeholder="e.g. 0,14,-1"
                            disabled={!editable}
                            className="max-w-[120px]"
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>Specify the dates in the month to perform the habit. 0=1st, 1=2nd, ..., -1=last day of month</TooltipContent>
                        </Tooltip>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Label htmlFor="cycle-leap" className="min-w-[48px]">Leap</Label>
                    <Input
                        id="cycle-leap"
                        type="number"
                        min={0}
                        value={cycle.leap}
                        onChange={e => editable && setCycle({ ...cycle, leap: parseInt(e.target.value) || 0 })}
                        disabled={!editable}
                        className="max-w-[80px]"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                        </TooltipTrigger>
                        <TooltipContent>Leaping allows for resting between cycles. A value of 1 means to perform the habit every other cycle.</TooltipContent>
                    </Tooltip>
                </div>

                {cycle.leap > 0 && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cycle-base" className="min-w-[48px]">Start date</Label>
                        {(() => {
                            // Compute all possible next dates for each base value
                            const dateOptions = [];
                            for (let b = 0; b <= cycle.leap; b++) {
                                const nextDate = findNextDueDate({ ...cycle, base: b }, new Date().toISOString().slice(0, 10));
                                dateOptions.push({ base: b, date: nextDate });
                            }
                            // Sort by date ascending
                            dateOptions.sort((a, b) => a.date.localeCompare(b.date));
                            // If current base is not in sorted order, select the earliest by default
                            const selectedBase = dateOptions.some(opt => opt.base === cycle.base) ? cycle.base : dateOptions[0]?.base;
                            return (
                                <Select
                                    value={selectedBase}
                                    onValueChange={val => {
                                        if (!editable) return;
                                        setCycle({ ...cycle, base: parseInt(val) });
                                    }}
                                    disabled={!editable}
                                >
                                    {dateOptions.map(opt => (
                                        <SelectItem key={opt.base} value={opt.base}>{opt.date}</SelectItem>
                                    ))}
                                </Select>
                            );
                        })()}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>Select which date to align the cycle to. This sets the offset internally.</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
