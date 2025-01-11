import { describe, it, expect } from 'vitest';
import * as cycle from '../cycle';

describe('isHabitDueOnDate', () => {
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
		// { habit: { cycle: { unit: cycle.CycleUnit.MONTH, slots: [0], phase: 1 } }, date: '2025-02-01', expected: true },
		// No habit or cycle
		{ habit: null, date: '2025-01-01', expected: true },
		{ habit: {}, date: '2025-01-01', expected: true },
	];
	cases.forEach(({ habit, date, expected }) => {
		it(`returns ${expected} for habit=${JSON.stringify(habit)} date=${date}`, () => {
			expect(cycle.isHabitDueOnDate(habit, date)).toBe(expected);
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
