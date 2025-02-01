import { db, executeWithRetry } from './dbManager.js';
import { STORES, ACTION_COLUMNS, INDEXES } from './constants.js';

export const toggleHabitForDate = async (habitId, date, completed) => {
  if (completed !== true && completed !== false) {
    throw new Error("completed must be true or false");
  }
  return await executeWithRetry(async () => {
    return await db.transaction('rw', db.actions, async () => {
      const existing = await db.actions.where('[habit_id+date]').equals([habitId, date]).first();
      let createdAt;
      if (existing) {
        createdAt = existing[ACTION_COLUMNS.CREATED_AT];
      } else {
        // Use current timestamp for created_at
        createdAt = new Date().toISOString();
      }
      const action = {
        [ACTION_COLUMNS.HABIT_ID]: habitId,
        [ACTION_COLUMNS.CREATED_AT]: createdAt,
        [ACTION_COLUMNS.DATE]: date,
        [ACTION_COLUMNS.DONE]: completed
      };
      await db.actions.put(action);
      return completed;
    });
  });
};

export const getActionsForDate = async (date) => {
  return await executeWithRetry(async () => {
    const actions = await db.actions.where(ACTION_COLUMNS.DATE).equals(date).and(action => action[ACTION_COLUMNS.DONE] === true).toArray();
    return actions.map(action => [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]]);
  });
};

export const isHabitCompletedForDate = async (habitId, date) => {
  return await executeWithRetry(async () => {
    const action = await db.actions.where('[habit_id+date]').equals([habitId, date]).first();
    return action ? action[ACTION_COLUMNS.DONE] === true : false;
  });
};

export const getCompletedActionsForDate = (date) => {
  if (!date) return Promise.resolve([]);
  return db.actions.where('date').equals(date).filter(action => action.done === true).toArray().then(actions => actions.map(action => [action.habit_id, action.created_at]));
};
