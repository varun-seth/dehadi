import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { clearDB, createMockHabitData, TEST_DATE } from '../db/__tests__/testHelpers.js';
import { useHabits, useHabitActions } from '../hooks.js';

describe('hooks', () => {
    beforeEach(async () => {
        await clearDB();
    }, 10000);

    describe('useHabits', () => {
        it('returns the expected structure', () => {
            const { result } = renderHook(() => useHabits());
            expect(result.current).toHaveProperty('habits');
            expect(result.current).toHaveProperty('loading');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('createHabit');
            expect(result.current).toHaveProperty('updateHabit');
            expect(result.current).toHaveProperty('deleteHabit');
            expect(result.current).toHaveProperty('swapHabitRanks');
            expect(result.current).toHaveProperty('updateHabitRank');
            expect(typeof result.current.createHabit).toBe('function');
            expect(typeof result.current.updateHabit).toBe('function');
            expect(typeof result.current.deleteHabit).toBe('function');
            expect(typeof result.current.swapHabitRanks).toBe('function');
            expect(typeof result.current.updateHabitRank).toBe('function');
        });

        it('createHabit function works', async () => {
            const { result } = renderHook(() => useHabits());
            const habitData = createMockHabitData();
            const newHabit = await result.current.createHabit(habitData);
            expect(newHabit).toMatchObject(habitData);
            expect(newHabit).toHaveProperty('id');
        });

        it('updateHabit function works', async () => {
            const { result } = renderHook(() => useHabits());
            const habitData = createMockHabitData();
            const newHabit = await result.current.createHabit(habitData);
            const updates = { name: 'Updated Habit' };
            const updatedHabit = await result.current.updateHabit(newHabit.id, updates);
            expect(updatedHabit.name).toBe('Updated Habit');
        });

        it('deleteHabit function works', async () => {
            const { result } = renderHook(() => useHabits());
            const habitData = createMockHabitData();
            const newHabit = await result.current.createHabit(habitData);
            await result.current.deleteHabit(newHabit.id);
            // We can't easily test the reactive update, but the function should not throw
        });

        it('swapHabitRanks function works', async () => {
            const { result } = renderHook(() => useHabits());
            const habit1Data = createMockHabitData();
            const habit2Data = createMockHabitData();
            const habit1 = await result.current.createHabit(habit1Data);
            const habit2 = await result.current.createHabit(habit2Data);
            await result.current.swapHabitRanks(habit1.id, habit2.id);
            // We can't easily test the reactive update, but the function should not throw
        });
    });

    describe('useHabitActions', () => {
        it('returns the expected structure', () => {
            const { result } = renderHook(() => useHabitActions(TEST_DATE));
            expect(result.current).toHaveProperty('actions');
            expect(result.current).toHaveProperty('loading');
            expect(result.current).toHaveProperty('error');
        });
    });
});