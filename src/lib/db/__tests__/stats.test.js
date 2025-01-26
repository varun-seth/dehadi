import { describe, it, expect, beforeEach } from 'vitest';
import { createHabit } from '../habits.js';
import { toggleHabitForDate } from '../actions.js';
import { getMonthlyScores, calculatePaceForHabit } from '../stats.js';
import { clearDB, createMockHabitData, TEST_DATE } from './testHelpers.js';

describe('stats db functions', () => {
    beforeEach(async () => {
        await clearDB();
    }, 10000);

    it('getMonthlyScores returns scores for each day in the month', async () => {
        // Test for January 2025
        const year = 2025;
        const month = 1; // January

        // No habits, should return 0 for all days
        const scores = await getMonthlyScores(year, month);
        expect(scores).toBeDefined();
        expect(Object.keys(scores)).toHaveLength(31); // January has 31 days
        Object.values(scores).forEach(score => expect(score).toBe(0));

        // Create one habit
        const habit = await createHabit(createMockHabitData());

        // Add action on TEST_DATE (2025-01-01)
        await toggleHabitForDate(habit.id, TEST_DATE, true);

        const scoresWithAction = await getMonthlyScores(year, month);
        expect(scoresWithAction[TEST_DATE]).toBe(100); // 1 out of 1 habit completed
        expect(scoresWithAction['2025-01-02']).toBe(0); // No action

        // Create another habit
        const habit2 = await createHabit(createMockHabitData());

        // Add action for habit2 on another date
        const anotherDate = '2025-01-15';
        await toggleHabitForDate(habit2.id, anotherDate, true);

        const scoresWithTwo = await getMonthlyScores(year, month);
        expect(scoresWithTwo[TEST_DATE]).toBe(50); // 1 out of 2 habits
        expect(scoresWithTwo[anotherDate]).toBe(50); // 1 out of 2 habits
        expect(scoresWithTwo['2025-01-03']).toBe(0);
    });

    it('calculatePaceForHabit returns the pace percentage for a habit', async () => {
        const habit = await createHabit(createMockHabitData());

        // No actions, pace should be 0
        const pace = await calculatePaceForHabit(habit.id);
        expect(pace).toBe(0);

        // Add action on TEST_DATE
        await toggleHabitForDate(habit.id, TEST_DATE, true);

        const paceWithAction = await calculatePaceForHabit(habit.id);
        expect(paceWithAction).toBeGreaterThan(0);
        expect(paceWithAction).toBeLessThanOrEqual(100);

        // Add another action on a different date
        const anotherDate = '2025-01-02';
        await toggleHabitForDate(habit.id, anotherDate, true);

        const paceWithTwo = await calculatePaceForHabit(habit.id);
        expect(paceWithTwo).toBeGreaterThan(0);
        expect(paceWithTwo).toBeLessThanOrEqual(100);
    });

    it('calculatePaceForHabit returns 0 for non-existent habit', async () => {
        const pace = await calculatePaceForHabit('non-existent');
        expect(pace).toBe(0);
    });
});
