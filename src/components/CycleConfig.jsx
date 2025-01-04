

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
                        <TooltipContent>Length of each cycle.</TooltipContent>
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
                        <div className="flex gap-1 flex-wrap">
                            {[...Array(31)].map((_, idx) => (
                                <Button
                                    type="button"
                                    key={idx}
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
                                >{idx + 1}</Button>
                            ))}
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>The dates in the month to perform the habit.</TooltipContent>
                        </Tooltip>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Label htmlFor="cycle-rest" className="min-w-[48px]">Rest</Label>
                    <Input
                        id="cycle-rest"
                        type="number"
                        min={0}
                        value={cycle.rest}
                        onChange={e => editable && setCycle({ ...cycle, rest: parseInt(e.target.value) || 0 })}
                        disabled={!editable}
                        className="max-w-[80px]"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                        </TooltipTrigger>
                        <TooltipContent>
                            {cycle.unit === CycleUnit.DAY && 'Number of days to skip between active days.'}
                            {cycle.unit === CycleUnit.WEEK && 'Number of weeks to skip between active weeks.'}
                            {cycle.unit === CycleUnit.MONTH && 'Number of months to skip between active months.'}
                        </TooltipContent>
                    </Tooltip>
                </div>

                {cycle.rest > 0 && (
                    <div className="flex items-center gap-2">
                        <Label htmlFor="cycle-phase" className="min-w-[48px]">Phase</Label>
                        {(() => {
                            // Compute all possible next dates for each phase value
                            const dateOptions = [];
                            for (let p = 0; p <= cycle.rest; p++) {
                                const nextDate = findNextDueDate({ ...cycle, phase: p }, new Date().toISOString().slice(0, 10));
                                dateOptions.push({ phase: p, date: nextDate });
                            }
                            // Sort by date ascending
                            dateOptions.sort((a, b) => a.date.localeCompare(b.date));
                            // If current phase is not in sorted order, select the earliest by default
                            const selectedPhase = dateOptions.some(opt => opt.phase === cycle.phase) ? cycle.phase : dateOptions[0]?.phase;
                            return (
                                <Select
                                    value={selectedPhase}
                                    onValueChange={val => {
                                        if (!editable) return;
                                        setCycle({ ...cycle, phase: parseInt(val) });
                                    }}
                                    disabled={!editable}
                                    className="min-w-[250px]"
                                >
                                    {dateOptions.map(opt => (
                                        <SelectItem key={opt.phase} value={opt.phase} className="min-w-[250px]">{new Date(opt.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</SelectItem>
                                    ))}
                                </Select>
                            );
                        })()}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>Sets which date to align the cycle to (choices are 1 greater than the rest value).</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
