import { describe, it, expect, vi } from 'vitest';
import * as cycle from '../cycle';

describe('isCycleDueOnDate', () => {
	const cases = [
		// Daily
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY } }, date: '1970-01-01', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY } }, date: '2025-01-01', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY } }, date: '2025-01-02', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY } }, date: '2025-01-03', expected: true },
		// Daily, rest 1, phase 0 (should be true every other day)
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 1, phase: 0 } }, date: '1970-01-01', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 1, phase: 0 } }, date: '1970-01-02', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 1, phase: 1 } }, date: '1970-01-01', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 1, phase: 1 } }, date: '1970-01-02', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 5, phase: 0 } }, date: '1970-01-01', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 5, phase: 0 } }, date: '1970-01-02', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 5, phase: 0 } }, date: '1970-01-06', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.DAY, rest: 5, phase: 0 } }, date: '1970-01-07', expected: true },
		// Weekly, slots [0,1], rest 0
		// 1970-01-01 is Thursday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [4], rest: 0, phase: 0 } }, date: '1970-01-01', expected: true },
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [4], rest: 0, phase: 0 } }, date: '1970-01-02', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [4], rest: 0, phase: 0 } }, date: '1970-01-08', expected: true },
		// 2025-01-01 is Wednesday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-01', expected: false }, // Wednesday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-02', expected: false }, // Thursday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-03', expected: false }, // Friday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-04', expected: false }, // Saturday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-05', expected: true }, // Sunday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-06', expected: true }, // Monday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0, 1], rest: 0, phase: 0 } }, date: '2025-01-07', expected: false }, // Tuesday
		// use rest for weekly.
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0], rest: 1, phase: 0 } }, date: '2025-01-05', expected: true }, // Sunday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0], rest: 1, phase: 0 } }, date: '2025-01-12', expected: false }, // Next Sunday is skipped (rest)
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [0], rest: 1, phase: 0 } }, date: '2025-01-19', expected: true }, // Next Next Sunday
		// Monthly, slots [0], leap 0
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [0], } }, date: '2025-01-01', expected: true }, // 1st of month
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [0], } }, date: '2025-01-02', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [0], rest: 1, phase: 1 } }, date: '2025-01-01', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [0], rest: 1, phase: 1 } }, date: '2025-02-01', expected: true },
		// Monthly with negative slots: -1 = last day
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [-1], } }, date: '2025-01-31', expected: true }, // Last day of January
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [-1], } }, date: '2025-01-30', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [-1], } }, date: '2025-02-28', expected: true }, // Last day of February 2025
		{ habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [-1], } }, date: '2025-02-27', expected: false },

		// Weekly with empty slots (should allow all days)
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2024-12-29', expected: true }, // Sunday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2024-12-30', expected: true }, // Monday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2024-12-31', expected: true }, // Tuesday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2025-01-01', expected: true }, // Wednesday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2025-01-02', expected: true }, // Thursday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2025-01-03', expected: true }, // Friday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2025-01-04', expected: true }, // Saturday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 1 } }, date: '2025-01-05', expected: false }, // Sunday
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 0 } }, date: '2025-01-04', expected: false },
		{ habit: { cycle: { unit: cycle.CycleUnit.WEEK, slots: [], rest: 1, phase: 0 } }, date: '2025-01-05', expected: true }, // Sunday
	];
	cases.forEach(({ habit, date, expected }) => {
		it(`returns ${expected} for habit=${JSON.stringify(habit)} date=${date}`, () => {
			const cycleObj = habit && habit.cycle ? habit.cycle : null;
			expect(cycle.isCycleDueOnDate(cycleObj, date)).toBe(expected);
		});
	});
});

describe('findNextDueDate', () => {
	it('finds next due date for daily habit', () => {
		const cycleConfig = { unit: cycle.CycleUnit.DAY };
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-01')).toBe('2025-01-01');
	});
	it('finds next due date for weekly habit with slots', () => {
		const cycleConfig = { unit: cycle.CycleUnit.WEEK, slots: [1] };
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-01')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-02')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-03')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-04')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-05')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-06')).toBe('2025-01-06');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-07')).toBe('2025-01-13');
	});
	it('finds next due date for monthly habit with slots', () => {
		const cycleConfig = { unit: cycle.CycleUnit.MONTH, slots: [2] };
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-01')).toBe('2025-01-03');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-02')).toBe('2025-01-03');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-03')).toBe('2025-01-03');
		expect(cycle.findNextDueDate(cycleConfig, '2025-01-04')).toBe('2025-02-03');
	});
});

describe('getPhaseDates', () => {
	beforeEach(() => {
		// Mock Date to return 2025-01-01
		const mockDate = new Date('2025-01-01T00:00:00');
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns empty array for cycle with rest 0', () => {
		const phases = cycle.getPhaseDates(cycle.CycleUnit.DAY, 0);
		expect(phases).toEqual([]);
	});

	it('returns phases for daily cycle with rest 1', () => {
		const phases = cycle.getPhaseDates(cycle.CycleUnit.DAY, 1);
		expect(phases).toHaveLength(2);
		expect(phases[0]).toEqual({ phase: 1, date: '2025-01-01' });
		expect(phases[1]).toEqual({ phase: 0, date: '2025-01-02' });
	});

	it('returns phases for weekly cycle with rest 1', () => {
		const phases = cycle.getPhaseDates(cycle.CycleUnit.WEEK, 1);
		expect(phases).toHaveLength(2);
		expect(phases[0]).toEqual({ phase: 1, date: '2024-12-29' });
		expect(phases[1]).toEqual({ phase: 0, date: '2025-01-05' });
	});



	it('returns phases for monthly cycle with rest 1', () => {
		const phases = cycle.getPhaseDates(cycle.CycleUnit.MONTH, 1);
		expect(phases).toHaveLength(2);
		expect(phases[0]).toEqual({ phase: 0, date: '2025-01-01' });
		expect(phases[1]).toEqual({ phase: 1, date: '2025-02-01' });
	});

	it('returns phases for monthly cycle with rest 2', () => {
		const phases = cycle.getPhaseDates(cycle.CycleUnit.MONTH, 2);
		expect(phases).toHaveLength(3);
		expect(phases[0]).toEqual({ phase: 0, date: '2025-01-01' });
		expect(phases[1]).toEqual({ phase: 1, date: '2025-02-01' });
		expect(phases[2]).toEqual({ phase: 2, date: '2025-03-01' });
	});

	it('sorts phases by date when they are not in order', () => {
		// Create a cycle where phase 1 comes before phase 0 in time
		const phases = cycle.getPhaseDates(cycle.CycleUnit.DAY, 1);
		// Even though we start with phase 0, the sorting should put the earliest date first
		expect(phases[0].phase).toBe(1); // 2025-01-01 comes before 2025-01-02
		expect(phases[1].phase).toBe(0);
	});
});

describe('getPhaseLabel', () => {
	beforeEach(() => {
		// Mock Date to return 2025-01-01
		const mockDate = new Date('2025-01-01T00:00:00');
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('returns month year format for monthly unit', () => {
		for (let i = 1; i <= 31; i++) {
			const label = cycle.getPhaseLabel(cycle.CycleUnit.MONTH, `2025-01-${i.toString().padStart(2, '0')}`);
			expect(label).toBe('January 2025');
		}
		for (let i = 1; i <= 28; i++) {
			const label = cycle.getPhaseLabel(cycle.CycleUnit.MONTH, `2025-02-${i.toString().padStart(2, '0')}`);
			expect(label).toBe('February 2025');
		}
		for (let j = 1; j <= 12; j++) {
			const monthName = new Date(2025, j - 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
			const label = cycle.getPhaseLabel(cycle.CycleUnit.MONTH, `2025-${j.toString().padStart(2, '0')}-01`);
			expect(label).toBe(monthName);
		}
	});

	it('returns full date format for daily unit', () => {
		const label = cycle.getPhaseLabel(cycle.CycleUnit.DAY, '2025-01-01');
		expect(label).toBe('Wednesday, January 1, 2025');
	});

	it('returns week range format for weekly unit', () => {
		for (const date of ['2024-12-29', '2024-12-30', '2024-12-31', '2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04']) {
			const label = cycle.getPhaseLabel(cycle.CycleUnit.WEEK, date);
			expect(label).toBe('29 December, 2024 - 4 January, 2025');
		}
		// Also test a date in the next week
		for (const date of ['2025-01-05', '2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10', '2025-01-11']) {
			const label = cycle.getPhaseLabel(cycle.CycleUnit.WEEK, date);
			expect(label).toBe('5 January, 2025 - 11 January, 2025');
		}
	});
});
