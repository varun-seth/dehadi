import { db, executeWithRetry } from './dbManager.js';
import { STORES, ACTION_COLUMNS, INDEXES } from './constants.js';

export const toggleHabitForDate = async (habitId, date) => {
  return await executeWithRetry(async () => {
    return await db.transaction('rw', db.actions, async () => {
      const existingActions = await db.actions.where('[date+habit_id]').equals([date, habitId]).toArray();
      if (existingActions.length > 0) {
        await db.actions.where('[date+habit_id]').equals([date, habitId]).delete();
        return false;
      } else {
        const now = new Date().toISOString();
        const action = {
          [ACTION_COLUMNS.HABIT_ID]: habitId,
          [ACTION_COLUMNS.CREATED_AT]: now,
          [ACTION_COLUMNS.DATE]: date
        };
        await db.actions.add(action);
        return true;
      }
    });
  });
};

export const getActionsForDate = async (date) => {
  return await executeWithRetry(async () => {
    const actions = await db.actions.where(ACTION_COLUMNS.DATE).equals(date).toArray();
    return actions.map(action => [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]]);
  });
};

export const getActionsBetweenDates = async (startDate, endDate) => {
  return await executeWithRetry(async () => {
    return await db.actions.where(ACTION_COLUMNS.DATE).between(startDate, endDate).toArray();
  });
};

export const isHabitCompletedForDate = async (habitId, date) => {
  return await executeWithRetry(async () => {
    const actions = await db.actions.where('[date+habit_id]').equals([date, habitId]).toArray();
    return actions.length > 0;
  });
};
