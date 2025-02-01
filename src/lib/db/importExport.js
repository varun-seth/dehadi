import { db, executeWithRetry } from './dbManager.js';
import { STORES, HABIT_COLUMNS, ACTION_COLUMNS } from './constants.js';

const areObjectsEqual = (obj1, obj2) => {
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (key === 'created_at' || key === 'updated_at' || key === 'rank') continue;
    if (key === 'cycle') {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) return false;
  }
  return true;
};

export const exportAllData = async () => {
  return await executeWithRetry(async () => {
    const [habits, actions] = await Promise.all([
      db.habits.toArray(),
      db.actions.toArray()
    ]);
    return {
      habits,
      actions
    };
  });
};

export const importAllData = async (importData) => {
  if (!importData || typeof importData !== 'object') {
    throw new Error('Invalid import data format');
  }
  const { habits = [], actions = [] } = importData;
  if (!Array.isArray(habits) || !Array.isArray(actions)) {
    throw new Error('Invalid import data: habits and actions must be arrays');
  }

  return await executeWithRetry(async () => {
    return await db.transaction('rw', db.habits, db.actions, async () => {
      let habitsCreated = 0;
      let habitsUpdated = 0;
      let habitsExisted = 0;
      let actionsCreated = 0;
      let actionsUpdated = 0;
      let actionsExisted = 0;

      for (const habit of habits) {
        if (!habit[HABIT_COLUMNS.ID]) {
          continue;
        }
        const existingHabit = await db.habits.get(habit[HABIT_COLUMNS.ID]);
        if (existingHabit) {
          const backupUpdatedAt = new Date(habit[HABIT_COLUMNS.UPDATED_AT]);
          const localUpdatedAt = new Date(existingHabit[HABIT_COLUMNS.UPDATED_AT]);
          if (backupUpdatedAt > localUpdatedAt) {
            habitsUpdated++;
            await db.habits.put(habit);
          } else {
            habitsExisted++;
          }
        } else {
          habitsCreated++;
          await db.habits.put(habit);
        }
      }

      for (const action of actions) {
        if (!action[ACTION_COLUMNS.HABIT_ID] || !action[ACTION_COLUMNS.CREATED_AT]) {
          continue;
        }
        const actionKey = [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]];
        const existingAction = await db.actions.get(actionKey);
        if (existingAction) {
          if (areObjectsEqual(existingAction, action)) {
            actionsExisted++;
            continue;
          }
          actionsUpdated++;
        } else {
          actionsCreated++;
        }
        await db.actions.put(action);
      }

      return {
        habitsCreated,
        habitsUpdated,
        habitsExisted,
        actionsCreated,
        actionsUpdated,
        actionsExisted
      };
    });
  });
};
