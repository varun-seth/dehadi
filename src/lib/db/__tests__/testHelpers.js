import { STORES } from '../constants.js';
import { openDB } from '../openDB.js';
import { generateId } from '../habits.js';

export const clearDB = async () => {
    const db = await openDB();
    const tx = db.transaction([STORES.HABITS, STORES.ACTIONS], 'readwrite');
    const habitStore = tx.objectStore(STORES.HABITS);
    const actionStore = tx.objectStore(STORES.ACTIONS);
    habitStore.clear();
    actionStore.clear();
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => {
            db.close();
            resolve();
        };
        tx.onerror = reject;
    });
};

export const createMockHabitData = (overrides = {}) => ({
    name: `Test Habit ${crypto.randomUUID()}`,
    description: 'A test habit',
    color: '#ffffff',
    icon: 'test-icon',
    cycle: { unit: 'day' },
    ...overrides
});

export const createMockHabit = (overrides = {}) => ({
    id: generateId(),
    ...createMockHabitData(),
    created_at: TEST_DATE + 'T00:00:00.000Z',
    updated_at: TEST_DATE + 'T00:00:00.000Z',
    rank: 1,
    ...overrides
});

export const createMockAction = (habitId, overrides = {}) => ({
    habit_id: habitId,
    date: TEST_DATE,
    created_at: TEST_DATE + 'T00:00:00.000Z',
    ...overrides
});

export const TEST_DATE = '2025-01-01';