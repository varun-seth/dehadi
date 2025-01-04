

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select.jsx';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';



export function CycleConfig({ cycle, setCycle, editable = true }) {
    const help = {
        unit: {
            short: 'Unit sets the scale of the cycle (day/week/month/year).',
            long: 'Unit sets the scale of the cycle. "day" means every day, "week" means specific days of the week, "month" means specific dates in a month, "year" means specific months or dates in a year.'
        },
        slots: {
            short: 'Slots pick specific days/dates/months for the cycle.',
            long: 'Slots are 0-indexed. For week: [0,2,4]=Mon,Wed,Fri. For month: [14]=15th. For year: [0]=Jan 1st, [-1]=Dec 31st. For day, slots are ignored.'
        },
        leap: {
            short: 'Leap sets the skip interval (0=none, 1=skip 1, etc).',
            long: 'Leap sets how often the cycle repeats. 0=every unit, 1=do one, skip one, etc. For example, leap=2 means do once every 3 units.'
        },
        base: {
            short: 'Base aligns the cycle to a specific date.',
            long: 'Base helps align the cycle to a particular date if leap > 0. It is used to calculate if today is the special day using epoch math.'
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-2 w-full max-w-md">
            <TooltipProvider>
                <div className="flex items-center gap-2">
                    <Label htmlFor="cycle-unit" className="min-w-[48px]">Unit</Label>
                    <Select
                        value={cycle.unit}
                        onValueChange={val => editable && setCycle({ ...cycle, unit: val, slots: null })}
                        disabled={!editable}
                    >
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                    </Select>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                        </TooltipTrigger>
                        <TooltipContent>{help.unit.short}</TooltipContent>
                    </Tooltip>
                </div>

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
                        <TooltipContent>{help.leap.short}</TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-2">
                    <Label htmlFor="cycle-base" className="min-w-[48px]">Base</Label>
                    <Input
                        id="cycle-base"
                        type="number"
                        min={0}
                        value={cycle.base}
                        onChange={e => editable && setCycle({ ...cycle, base: parseInt(e.target.value) || 0 })}
                        disabled={!editable}
                        className="max-w-[80px]"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                        </TooltipTrigger>
                        <TooltipContent>{help.base.short}</TooltipContent>
                    </Tooltip>
                </div>

                {cycle.unit === 'week' && (
                    <div className="flex items-center gap-2">
                        <Label className="min-w-[48px]">Days</Label>
                        <div className="flex gap-1 flex-wrap">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
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
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>{help.slots.short}</TooltipContent>
                        </Tooltip>
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
                            <TooltipContent>{help.slots.short}</TooltipContent>
                        </Tooltip>
                    </div>
                )}
                {cycle.unit === 'year' && (
                    <div className="flex items-center gap-2">
                        <Label className="min-w-[48px]">Months</Label>
                        <Input
                            type="text"
                            value={cycle.slots ? cycle.slots.join(',') : ''}
                            onChange={e => editable && setCycle({
                                ...cycle,
                                slots: e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))
                            })}
                            placeholder="e.g. 0,6,-1"
                            disabled={!editable}
                            className="max-w-[120px]"
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><HelpCircle size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>{help.slots.short}</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
