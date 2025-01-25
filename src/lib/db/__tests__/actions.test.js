import { describe, it, expect, beforeEach } from 'vitest';
import { STORES } from '../constants.js';
import { createHabit } from '../habits.js';
import {
    toggleHabitForDate,
    getActionsForDate,
    isHabitCompletedForDate
} from '../actions.js';
import { clearDB, createMockHabitData, TEST_DATE } from './testHelpers.js';

describe('actions db functions', () => {
    beforeEach(async () => {
        await clearDB();
    }, 10000);

    it('toggleHabitForDate adds action if not exists and returns true', async () => {
        const habit = await createHabit(createMockHabitData());
        const result = await toggleHabitForDate(habit.id, TEST_DATE);
        expect(result).toBe(true);
        const completed = await isHabitCompletedForDate(habit.id, TEST_DATE);
        expect(completed).toBe(true);
    });

    it('toggleHabitForDate removes action if exists and returns false', async () => {
        const habit = await createHabit(createMockHabitData());
        await toggleHabitForDate(habit.id, TEST_DATE); // add
        const result = await toggleHabitForDate(habit.id, TEST_DATE); // remove
        expect(result).toBe(false);
        const completed = await isHabitCompletedForDate(habit.id, TEST_DATE);
        expect(completed).toBe(false);
    });

    it('getActionsForDate returns actions for the date', async () => {
        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());
        await toggleHabitForDate(habit1.id, TEST_DATE);
        await toggleHabitForDate(habit2.id, TEST_DATE);
        const actions = await getActionsForDate(TEST_DATE);
        expect(actions).toHaveLength(2);
        expect(actions).toContainEqual([habit1.id, expect.any(String)]);
        expect(actions).toContainEqual([habit2.id, expect.any(String)]);
    });

    it('getActionsForDate returns empty array for date with no actions', async () => {
        const actions = await getActionsForDate(TEST_DATE);
        expect(actions).toEqual([]);
    });

    it('isHabitCompletedForDate returns true if action exists', async () => {
        const habit = await createHabit(createMockHabitData());
        await toggleHabitForDate(habit.id, TEST_DATE);
        const completed = await isHabitCompletedForDate(habit.id, TEST_DATE);
        expect(completed).toBe(true);
    });

    it('isHabitCompletedForDate returns false for non-existent habit', async () => {
        const completed = await isHabitCompletedForDate('non-existent', TEST_DATE);
        expect(completed).toBe(false);
    });
});
