import { describe, it, expect, beforeEach } from 'vitest';
import { createHabit } from '../habits.js';
import { toggleHabitForDate } from '../actions.js';
import { exportAllData, importAllData } from '../importExport.js';
import { clearDB, createMockHabitData, createMockHabit, TEST_DATE } from './testHelpers.js';

describe('importExport db functions', () => {
    beforeEach(async () => {
        await clearDB();
    }, 10000);

    it('exportAllData returns empty data when no habits or actions', async () => {
        const data = await exportAllData();
        expect(data).toEqual({
            habits: [],
            actions: []
        });
    });

    it('exportAllData returns habits and actions', async () => {
        const habit1 = await createHabit(createMockHabitData());
        const habit2 = await createHabit(createMockHabitData());

        await toggleHabitForDate(habit1.id, TEST_DATE);
        await toggleHabitForDate(habit2.id, '2025-01-02');

        const data = await exportAllData();
        expect(data.habits).toHaveLength(2);
        expect(data.actions).toHaveLength(2);

        // Check habits have the right structure
        data.habits.forEach(habit => {
            expect(habit).toHaveProperty('id');
            expect(habit).toHaveProperty('name');
            expect(habit).toHaveProperty('created_at');
        });

        // Check actions have the right structure
        data.actions.forEach(action => {
            expect(action).toHaveProperty('habit_id');
            expect(action).toHaveProperty('date');
            expect(action).toHaveProperty('created_at');
        });
    });

    describe('importAllData habits scenarios', () => {
        const scenarios = [
            {
                name: '(0,0,0) empty existing data, empty new data',
                initialHabits: [],
                importHabits: [],
                expected: { habitsCreated: 0, habitsUpdated: 0, habitsExisted: 0 }
            },
            {
                name: '(1,0,0) empty db, 1 new habit from file',
                initialHabits: [],
                importHabits: [createMockHabit()],
                expected: { habitsCreated: 1, habitsUpdated: 0, habitsExisted: 0 }
            },
            {
                name: '(0,0,1) 1 habit in db, 1 identical habit in import',
                initialHabits: [createMockHabit({ id: '1', name: 'Identical Habit' })],
                importHabits: [createMockHabit({ id: '1', name: 'Identical Habit' })],
                expected: { habitsCreated: 0, habitsUpdated: 0, habitsExisted: 1 }
            },
            {
                name: '(0,1,0) 1 habit in db, 1 habit in import with same id, different value',
                initialHabits: [createMockHabit({ id: '1' })],
                importHabits: [createMockHabit({ id: '1' })],
                expected: { habitsCreated: 0, habitsUpdated: 1, habitsExisted: 0 }
            },
            {
                name: '(0,0,1) 1 habit in db, 1 habit in import with same id, same value',
                initialHabits: [createMockHabit({ id: '1', name: 'Same Name' })],
                importHabits: [createMockHabit({ id: '1', name: 'Same Name' })],
                expected: { habitsCreated: 0, habitsUpdated: 0, habitsExisted: 1 }
            },
            {
                name: '(1,1,0) 1 habit in db updated, 1 new habit in import',
                initialHabits: [createMockHabit({ id: '1', name: 'Original' })],
                importHabits: [
                    createMockHabit({ id: '1', name: 'Updated' }),
                    createMockHabit()
                ],
                expected: { habitsCreated: 1, habitsUpdated: 1, habitsExisted: 0 }
            },
            {
                name: '(1,0,1) 1 new habit, 1 same habit in import',
                initialHabits: [createMockHabit({ id: '1', name: 'Same' })],
                importHabits: [
                    createMockHabit({ id: '1', name: 'Same' }),
                    createMockHabit()
                ],
                expected: { habitsCreated: 1, habitsUpdated: 0, habitsExisted: 1 }
            },
            {
                name: '(0,1,1) 1 updated, 1 same habit in import',
                initialHabits: [
                    createMockHabit({ id: '1', name: 'Original' }),
                    createMockHabit({ id: '2', name: 'Same' })
                ],
                importHabits: [
                    createMockHabit({ id: '1', name: 'Updated' }),
                    createMockHabit({ id: '2', name: 'Same' })
                ],
                expected: { habitsCreated: 0, habitsUpdated: 1, habitsExisted: 1 }
            },
            {
                name: '(1,1,1) 1 new, 1 updated, 1 same habit in import',
                initialHabits: [
                    createMockHabit({ id: '1', name: 'Original' }),
                    createMockHabit({ id: '2', name: 'Same' })
                ],
                importHabits: [
                    createMockHabit({ id: '1', name: 'Updated' }),
                    createMockHabit({ id: '2', name: 'Same' }),
                    createMockHabit()
                ],
                expected: { habitsCreated: 1, habitsUpdated: 1, habitsExisted: 1 }
            }
        ];

        it.each(scenarios)('$name', async ({ initialHabits, importHabits, expected }) => {
            // Set up initial data
            for (const habit of initialHabits) {
                await createHabit(habit);
            }

            // Prepare import data
            const importData = {
                habits: importHabits,
                actions: []
            };

            // Import
            const result = await importAllData(importData);

            // Check result
            expect(result).toMatchObject(expected);
        });
    });

    it('importAllData throws error for invalid data', async () => {
        await expect(importAllData(null)).rejects.toThrow('Invalid import data format');
        await expect(importAllData('string')).rejects.toThrow('Invalid import data format');
        await expect(importAllData({ habits: 'not array' })).rejects.toThrow('Invalid import data: habits and actions must be arrays');
        await expect(importAllData({ actions: 'not array' })).rejects.toThrow('Invalid import data: habits and actions must be arrays');
    });

    it('importAllData skips invalid habits and actions', async () => {
        const importData = {
            habits: [
                { name: 'Invalid habit without id' },
                createMockHabit({ name: 'Valid Habit' })
            ],
            actions: [
                { date: '2025-01-01' }, // Missing habit_id and created_at
                {
                    habit_id: 'valid-id',
                    date: '2025-01-01',
                    created_at: '2025-01-01T00:00:00.000Z'
                }
            ]
        };

        const result = await importAllData(importData);
        expect(result).toEqual({
            habitsCreated: 1,
            habitsUpdated: 0,
            habitsExisted: 0,
            actionsCreated: 1,
            actionsUpdated: 0,
            actionsExisted: 0
        });
    });
});