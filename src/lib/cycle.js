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
export function isCycleDueOnDate(cycle, dateStr) {
  if (!cycle) return true;
  const { unit, slots, rest = 0, phase = 0 } = cycle;
  const date = new Date(dateStr + 'T00:00:00Z');
  // Epoch reference: 1970-01-01 UTC
  const epoch = new Date('1970-01-01T00:00:00Z');
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
    const weekStart = getWeekStart(date);
    const epochWeeks = Math.floor((weekStart - epoch) / (1000 * 60 * 60 * 24 * 7));
    const phaseValue = epochWeeks % (rest + 1);
    return phaseValue === phase;
  }
  if (unit === CycleUnit.MONTH) {
    const dayOfMonth = date.getDate(); // 1 to 31
    if (Array.isArray(slots) && slots.length > 0) {
      let matches = false;
      for (const slot of slots) {
        if (slot >= 0) {
          if (slot + 1 === dayOfMonth) matches = true;
        } else {
          // negative: -1 = last day, -2 = second last, etc.
          const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
          const targetDay = lastDay + slot + 1;
          if (targetDay === dayOfMonth) matches = true;
        }
      }
      if (!matches) return false;
    }
    if (rest === 0) return true;
    // Epoch months since 1970-01-01
    const epochMonths = (date.getFullYear() - 1970) * 12 + date.getMonth();
    return (epochMonths % (rest + 1)) === phase;
  }
  return true;
}

// Finds the next due date for a given cycle config, starting from today

import { formatLocalDate, getTodayString } from './date';

export function findNextDueDate(cycle, fromDateStr) {
  const maxTries = 10000;
  let date = fromDateStr ? new Date(fromDateStr + 'T00:00:00Z') : new Date();
  for (let i = 0; i < maxTries; i++) {
    const dateStr = formatLocalDate(date);
    if (isCycleDueOnDate(cycle, dateStr)) {
      return dateStr;
    }
    // Increment date by 1 day
    date.setDate(date.getDate() + 1);
  }
  return null;
}

// Helper to get the start of the week (Sunday) for a given date
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
};

export const getPhaseDates = (unit, rest) => {
  if (rest <= 0) return [];
  if (unit === CycleUnit.WEEK) {
    // For weekly cycles, return the start of the week for each phase
    const phases = [];
    const today = new Date(getTodayString() + 'T00:00:00');
    const epoch = new Date('1970-01-01T00:00:00');
    let currentWeekStart = getWeekStart(today);
    for (let p = 0; p <= rest; p++) {
      // Find the next week start for this phase
      let weekStart = new Date(currentWeekStart);
      for (let i = 0; i <= rest; i++) { // Check up to rest+1 weeks
        const epochWeeks = Math.floor((weekStart - epoch) / (1000 * 60 * 60 * 24 * 7));
        if ((epochWeeks % (rest + 1)) === p) {
          phases.push({ phase: p, date: formatLocalDate(weekStart) });
          break;
        }
        weekStart.setDate(weekStart.getDate() + 7);
      }
    }
    // Sort by date ascending
    phases.sort((a, b) => a.date.localeCompare(b.date));
    return phases;
  } else {
    // For daily and monthly, use next due date
    const dateOptions = [];
    for (let p = 0; p <= rest; p++) {
      const nextDate = findNextDueDate({ unit, rest, phase: p }, getTodayString());
      dateOptions.push({ phase: p, date: nextDate });
    }
    // Sort by date ascending
    dateOptions.sort((a, b) => a.date.localeCompare(b.date));
    return dateOptions;
  }
};

export const getPhaseLabel = (unit, dateString) => {
  if (unit === CycleUnit.MONTH) {
    return new Date(dateString).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } else if (unit === CycleUnit.WEEK) {
    // For weekly cycles, show the full week range (Sunday to Saturday)
    const date = new Date(dateString);
    // Find the Sunday of the week containing this date
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const sunday = new Date(date);
    sunday.setDate(date.getDate() - dayOfWeek);

    // Find the Saturday of the week
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);

    // Format as "DD Month, YYYY - DD Month, YYYY"
    const formatDate = (d) => {
      const day = d.getDate();
      const month = d.toLocaleDateString(undefined, { month: 'long' });
      const year = d.getFullYear();
      return `${day} ${month}, ${year}`;
    };

    return `${formatDate(sunday)} - ${formatDate(saturday)}`;
  } else {
    // For DAY, use full date format
    return new Date(dateString).toLocaleDateString(undefined, { dateStyle: 'full' });
  }
};