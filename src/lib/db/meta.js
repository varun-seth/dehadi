import { db, executeWithRetry } from './dbManager.js';
import { STORES } from './constants.js';

export const getTotalHabitsCount = async () => {
  return await executeWithRetry(async () => {
    return await db.habits.count();
  });
};

export const getTotalActionsCount = async () => {
  return await executeWithRetry(async () => {
    return await db.actions.count();
  });
};
