

import React, { useState, useMemo, useEffect } from 'react';
import { CycleUnit, getPhaseDates, getPhaseLabel } from '@/lib/cycle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectItem } from '@/components/ui/select.jsx';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Question } from '@phosphor-icons/react';



export function CycleConfig({ cycle, setCycle, editable = true }) {
    if (!cycle) return null;

    const [restInput, setRestInput] = useState(cycle.rest.toString());

    useEffect(() => {
        setRestInput(cycle.rest.toString());
    }, [cycle.rest]);


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
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><Question size={18} /></span>
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
                            <Button
                                type="button"
                                key={-1}
                                variant={cycle.slots?.includes(-1) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    if (!editable) return;
                                    const slots = cycle.slots || [];
                                    setCycle({
                                        ...cycle,
                                        slots: slots.includes(-1)
                                            ? slots.filter(d => d !== -1)
                                            : [...slots, -1]
                                    });
                                }}
                                disabled={!editable}
                                className="px-2"
                            >Last Day</Button>
                        </div>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><Question size={18} /></span>
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
                        inputMode="numeric"
                        value={restInput}
                        onChange={e => setRestInput(e.target.value)}
                        onBlur={() => {
                            const val = parseInt(restInput) || 0;
                            setCycle({ ...cycle, rest: val });
                            setRestInput(val.toString());
                        }}
                        disabled={!editable}
                        className="max-w-[80px]"
                    />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><Question size={18} /></span>
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
                        <Label htmlFor="cycle-phase" className="min-w-[48px]">Active Phase</Label>
                        {(() => {
                            const phases = getPhaseDates(cycle.unit, cycle.rest);
                            return (
                                <Select
                                    value={cycle.phase}
                                    onValueChange={val => {
                                        if (!editable) return;
                                        setCycle({ ...cycle, phase: parseInt(val) });
                                    }}
                                    disabled={!editable}
                                    className="min-w-[250px]"
                                >
                                    {phases.map(phase => (
                                        <SelectItem key={phase.phase} value={phase.phase} className="min-w-[250px]">{
                                            getPhaseLabel(cycle.unit, phase.date)
                                        }</SelectItem>
                                    ))}
                                </Select>
                            );
                        })()}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span tabIndex={-1} style={{ cursor: 'default', display: 'flex', alignItems: 'center' }}><Question size={18} /></span>
                            </TooltipTrigger>
                            <TooltipContent>This date or date-range will be used as the active cycle. After this, {cycle.rest} {cycle.unit === CycleUnit.DAY ? 'days' : cycle.unit === CycleUnit.WEEK ? 'weeks' : 'months'} will be skipped before the next active cycle.</TooltipContent>
                        </Tooltip>
                    </div>
                )}
            </TooltipProvider>
        </div>
    );
}
