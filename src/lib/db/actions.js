import { db, executeWithRetry } from './dbManager.js';
import { STORES, ACTION_COLUMNS, INDEXES } from './constants.js';

export const toggleHabitForDate = async (habitId, date, completed) => {
  if (completed !== true && completed !== false) {
    throw new Error("completed must be true or false");
  }
  return await executeWithRetry(async () => {
    return await db.transaction('rw', db.actions, async () => {
      const existingActions = await db.actions.where('[date+habit_id]').equals([date, habitId]).toArray();
      if (completed) {
        if (existingActions.length === 0) {
          const now = new Date().toISOString();
          const action = {
            [ACTION_COLUMNS.HABIT_ID]: habitId,
            [ACTION_COLUMNS.CREATED_AT]: now,
            [ACTION_COLUMNS.DATE]: date
          };
          await db.actions.add(action);
        }
        return true;
      } else {
        if (existingActions.length > 0) {
          await db.actions.where('[date+habit_id]').equals([date, habitId]).delete();
        }
        return false;
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



export const isHabitCompletedForDate = async (habitId, date) => {
  return await executeWithRetry(async () => {
    const actions = await db.actions.where('[date+habit_id]').equals([date, habitId]).toArray();
    return actions.length > 0;
  });
};
