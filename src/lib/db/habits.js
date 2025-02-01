import { db, executeWithRetry } from './dbManager.js';
import { STORES, HABIT_COLUMNS, ACTION_COLUMNS } from './constants.js';

export function generateId() {
  const words = new Uint32Array(2);
  crypto.getRandomValues(words);
  const value = (BigInt(words[0]) << 32n) | BigInt(words[1]);
  return value.toString().padStart(20, '0');

}

export const createHabit = async (habit) => {
  return await executeWithRetry(async () => {
    const allHabits = await db.habits.toArray();
    let maxRank = 0;
    allHabits.forEach(h => {
      const r = h[HABIT_COLUMNS.RANK];
      if (typeof r === 'number' && r > maxRank) maxRank = r;
    });
    const now = new Date().toISOString();
    const newHabit = {
      [HABIT_COLUMNS.ID]: generateId(),
      [HABIT_COLUMNS.CREATED_AT]: now,
      [HABIT_COLUMNS.UPDATED_AT]: now,
      [HABIT_COLUMNS.RANK]: maxRank + 1,
      ...habit
    };
    await db.habits.add(newHabit);
    return newHabit;
  });
};

export const getHabit = async (id) => {
  return await executeWithRetry(async () => {
    return await db.habits.get(id);
  });
};

export const updateHabit = async (id, updates) => {
  return await executeWithRetry(async () => {
    const habit = await db.habits.get(id);
    if (!habit) {
      throw new Error('Habit not found');
    }
    const updatedHabit = {
      ...habit,
      ...updates,
      [HABIT_COLUMNS.UPDATED_AT]: new Date().toISOString()
    };
    await db.habits.put(updatedHabit);
    return updatedHabit;
  });
};

export const deleteHabit = async (id) => {
  return await executeWithRetry(async () => {
    await db.transaction('rw', db.habits, db.actions, async () => {
      await db.habits.delete(id);
      await db.actions.where(ACTION_COLUMNS.HABIT_ID).equals(id).delete();
    });
  });
};

export const getAllHabits = async () => {
  return await executeWithRetry(async () => {
    let habits = await db.habits.toArray();
    let changed = false;
    habits.forEach((habit, i) => {
      if (typeof habit[HABIT_COLUMNS.RANK] !== 'number') {
        habit[HABIT_COLUMNS.RANK] = i + 1;
        changed = true;
      }
    });
    if (changed) {
      await db.habits.bulkPut(habits);
    }
    habits.sort((a, b) => (a[HABIT_COLUMNS.RANK] ?? 0) - (b[HABIT_COLUMNS.RANK] ?? 0));
    return habits;
  });
};

export const updateHabitRank = async (id, newRank) => {
  return await executeWithRetry(async () => {
    const habit = await db.habits.get(id);
    if (!habit) {
      throw new Error('Habit not found');
    }
    habit[HABIT_COLUMNS.RANK] = newRank;
    await db.habits.put(habit);
    return habit;
  });
};

export const swapHabitRanks = async (id1, id2) => {
  return await executeWithRetry(async () => {
    const [habit1, habit2] = await db.transaction('rw', db.habits, async () => {
      const h1 = await db.habits.get(id1);
      const h2 = await db.habits.get(id2);
      if (!h1 || !h2) {
        throw new Error('One or both habits not found');
      }
      const tempRank = h1[HABIT_COLUMNS.RANK];
      h1[HABIT_COLUMNS.RANK] = h2[HABIT_COLUMNS.RANK];
      h2[HABIT_COLUMNS.RANK] = tempRank;
      await db.habits.put(h1);
      await db.habits.put(h2);
      return [h1, h2];
    });
    return [habit1, habit2];
  });
};
