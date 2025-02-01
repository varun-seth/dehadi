import { describe, it, expect, beforeEach } from 'vitest';
import { STORES } from '../constants.js';
import { createHabit } from '../habits.js';
import { toggleHabitForDate } from '../actions.js';
import { getTotalHabitsCount, getTotalActionsCount } from '../meta.js';
import { isHabitCompletedForDate } from '../actions.js';
import { clearDB, createMockHabitData, TEST_DATE } from './testHelpers.js';

describe('meta db functions', () => {
    beforeEach(async () => {
        await clearDB();
    }, 10000);

    it('getTotalHabitsCount returns the number of habits', async () => {
        let count = await getTotalHabitsCount();
        expect(count).toBe(0);

        await createHabit(createMockHabitData());
        count = await getTotalHabitsCount();
        expect(count).toBe(1);

        await createHabit(createMockHabitData());
        await createHabit(createMockHabitData());
        count = await getTotalHabitsCount();
        expect(count).toBe(3);
    });

    it('getTotalActionsCount returns the number of actions', async () => {
        let count = await getTotalActionsCount();
        expect(count).toBe(0);

        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());

        await toggleHabitForDate(habit1.id, TEST_DATE, true);
        count = await getTotalActionsCount();
        expect(count).toBe(1);

        await toggleHabitForDate(habit2.id, TEST_DATE, true);
        count = await getTotalActionsCount();
        expect(count).toBe(2);

        // Toggle again to remove
        await toggleHabitForDate(habit1.id, TEST_DATE, false);
        count = await getTotalActionsCount();
        expect(count).toBe(2);
        // confirm the value is false now.
        const flag = await isHabitCompletedForDate(habit1.id, TEST_DATE);
        expect(flag).toBe(false);
    });
});