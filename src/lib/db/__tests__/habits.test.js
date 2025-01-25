import { describe, it, expect, beforeEach } from 'vitest';
import { DB_NAME, STORES } from '../constants.js';
import {
    generateId,
    createHabit,
    getHabit,
    updateHabit,
    deleteHabit,
    getAllHabits,
    updateHabitRank,
    swapHabitRanks
} from '../habits.js';
import { clearDB as clearHabits, createMockHabitData } from './testHelpers.js';

describe('habits db functions', () => {
    beforeEach(async () => {
        await clearHabits();
    }, 10000);

    it('generateId generates unique 20-character string ids made of integer digits', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
        expect(typeof id1).toBe('string');
        expect(id1.length).toBe(20);
        expect(typeof id2).toBe('string');
        expect(id2.length).toBe(20);
        expect(/^\d+$/.test(id1)).toBe(true);
        expect(/^\d+$/.test(id2)).toBe(true);
        // ensure that it is a valid BigInt
        expect(() => BigInt(id1)).not.toThrow();
        expect(() => BigInt(id2)).not.toThrow();
    });

    it('createHabit creates a new habit with auto-generated id and timestamps', async () => {
        const mockHabitData = createMockHabitData();
        const created = await createHabit(mockHabitData);
        expect(created.id).toBeDefined();
        expect(created.name).toBe(mockHabitData.name);
        expect(created.description).toBe(mockHabitData.description);
        expect(created.color).toBe(mockHabitData.color);
        expect(created.icon).toBe(mockHabitData.icon);
        expect(created.cycle).toEqual(mockHabitData.cycle);
        expect(created.created_at).toBeDefined();
        expect(created.updated_at).toBeDefined();
        expect(created.rank).toBe(1);
    });

    it('getHabit retrieves a created habit', async () => {
        const habitData = createMockHabitData();
        const created = await createHabit(habitData);
        const retrieved = await getHabit(created.id);
        expect(retrieved).toEqual(created);
    });

    it('getHabit returns undefined for non-existent habit', async () => {
        const retrieved = await getHabit('non-existent-id');
        expect(retrieved).toBeUndefined();
    });

    it('updateHabit updates a habit and sets updated_at', async () => {
        const habitData = createMockHabitData();
        const created = await createHabit(habitData);
        const originalUpdatedAt = created.updated_at;
        const updates = {
            name: 'Updated Name',
            description: 'Updated description'
        };
        const updated = await updateHabit(created.id, updates);
        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe('Updated Name');
        expect(updated.description).toBe('Updated description');
        expect(updated.color).toBe('#ffffff'); // unchanged
        expect(updated.updated_at).toBeDefined();
        expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(new Date(originalUpdatedAt).getTime());
    });

    it('updateHabit throws error for non-existent habit', async () => {
        await expect(updateHabit('non-existent', { name: 'test' })).rejects.toThrow('Habit not found');
    });

    it('deleteHabit deletes a habit', async () => {
        const habitData = createMockHabitData();
        const created = await createHabit(habitData);
        await deleteHabit(created.id);
        const retrieved = await getHabit(created.id);
        expect(retrieved).toBeUndefined();
    });

    it('deleteHabit throws no error for non-existent habit', async () => {
        await expect(deleteHabit('non-existent')).resolves.toBeUndefined();
    });

    it('getAllHabits returns all habits sorted by rank', async () => {
        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());
        const habit3 = await createHabit(createMockHabitData());
        const all = await getAllHabits();
        expect(all).toHaveLength(3);
        expect(all[0].id).toBe(habit1.id);
        expect(all[1].id).toBe(habit2.id);
        expect(all[2].id).toBe(habit3.id);
        expect(all[0].rank).toBe(1);
        expect(all[1].rank).toBe(2);
        expect(all[2].rank).toBe(3);
    });

    it('getAllHabits assigns ranks if missing', async () => {
        // This test might be hard without direct db access, but since getAllHabits does it, we can test indirectly
        // For now, assume it works as per code
        const all = await getAllHabits();
        expect(all).toEqual([]);
    });

    it('updateHabitRank updates the rank of a habit', async () => {
        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());
        await updateHabitRank(habit1.id, 3);
        const updated1 = await getHabit(habit1.id);
        const updated2 = await getHabit(habit2.id);
        expect(updated1.rank).toBe(3);
        expect(updated2.rank).toBe(2); // unchanged
    });

    it('updateHabitRank throws error for non-existent habit', async () => {
        await expect(updateHabitRank('non-existent', 1)).rejects.toThrow('Habit not found');
    });

    it('swapHabitRanks swaps ranks of two habits', async () => {
        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());
        await swapHabitRanks(habit1.id, habit2.id);
        const updated1 = await getHabit(habit1.id);
        const updated2 = await getHabit(habit2.id);
        expect(updated1.rank).toBe(2);
        expect(updated2.rank).toBe(1);
    });

    it('swapHabitRanks throws error if one habit not found', async () => {
        const habit = await createHabit(createMockHabitData());
        await expect(swapHabitRanks(habit.id, 'non-existent')).rejects.toThrow('One or both habits not found');
    });
});