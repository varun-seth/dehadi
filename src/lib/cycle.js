// Returns the default cycle config (daily)
export function getDefaultCycle() {
  return {
    unit: CycleUnit.DAY,
    slots: null,
  rest: 0,
    phase: 0
  };
}
// Enum for cycle units
export const CycleUnit = Object.freeze({
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
});

// Returns true if the habit should be done on the given date
export function isHabitDueOnDate(habit, dateStr) {
  if (!habit || !habit.cycle) return true;
  const { unit, slots, rest = 0, phase = 0 } = habit.cycle;
  const date = new Date(dateStr + 'T00:00:00');
  // Epoch reference: 1970-01-01
  const epoch = new Date('1970-01-01T00:00:00');
  if (unit === CycleUnit.DAY) {
    if (rest === 0) return true;
    // Epoch days since 1970-01-01
    const epochDays = Math.floor((date - epoch) / (1000 * 60 * 60 * 24));
  return (epochDays % (rest + 1)) === phase;
  }
  if (unit === CycleUnit.WEEK) {
    const weekday = date.getDay(); // 0=Sun, 1=Mon, ...
    if (Array.isArray(slots) && slots.length > 0 && !slots.includes(weekday)) return false;
    if (rest === 0) return true;
    // Epoch weeks since 1970-01-01
    const epochWeeks = Math.floor((date - epoch) / (1000 * 60 * 60 * 24 * 7));
  return (epochWeeks % (rest + 1)) === phase;
  }
  if (unit === CycleUnit.MONTH) {
    const dayOfMonth = date.getDate() - 1; // 0-indexed
    if (Array.isArray(slots) && slots.length > 0 && !slots.includes(dayOfMonth)) return false;
    if (rest === 0) return true;
    // Epoch months since 1970-01-01
    const epochMonths = (date.getFullYear() - 1970) * 12 + date.getMonth();
  return (epochMonths % (rest + 1)) === phase;
  }
  return true;
}

// Finds the next due date for a given cycle config, starting from today

import { formatLocalDate } from './date';

export function findNextDueDate(cycle, fromDateStr) {
  const maxTries = 10000;
  let date = fromDateStr ? new Date(fromDateStr + 'T00:00:00') : new Date();
  for (let i = 0; i < maxTries; i++) {
    const dateStr = formatLocalDate(date);
    if (isHabitDueOnDate({ cycle }, dateStr)) {
      return dateStr;
    }
    // Increment date by 1 day
    date.setDate(date.getDate() + 1);
  }
  return null;
}