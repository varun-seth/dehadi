import { openDB } from './openDB.js';
import { STORES, HABIT_COLUMNS, ACTION_COLUMNS } from './constants.js';

const areObjectsEqual = (obj1, obj2) => {
  if (!obj1 || !obj2) return false;
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
};

export const exportAllData = async () => {
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    try {
      const habitsTx = db.transaction(STORES.HABITS, 'readonly');
      const habitsStore = habitsTx.objectStore(STORES.HABITS);
      const habitsRequest = habitsStore.getAll();
      habitsRequest.onsuccess = async () => {
        const habits = habitsRequest.result || [];
        const actionsTx = db.transaction(STORES.ACTIONS, 'readonly');
        const actionsStore = actionsTx.objectStore(STORES.ACTIONS);
        const actionsRequest = actionsStore.getAll();
        actionsRequest.onsuccess = () => {
          const actions = actionsRequest.result || [];
          const exportData = {
            habits,
            actions
          };
          resolve(exportData);
        };
        actionsRequest.onerror = () => reject(actionsRequest.error);
      };
      habitsRequest.onerror = () => reject(habitsRequest.error);
    } catch (error) {
      reject(error);
    }
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
  const db = await openDB();
  return new Promise(async (resolve, reject) => {
    try {
      const tx = db.transaction([STORES.HABITS, STORES.ACTIONS], 'readwrite');
      const habitsStore = tx.objectStore(STORES.HABITS);
      const actionsStore = tx.objectStore(STORES.ACTIONS);
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
        const existingHabitRequest = habitsStore.get(habit[HABIT_COLUMNS.ID]);
        await new Promise((res, rej) => {
          existingHabitRequest.onsuccess = async () => {
            const existingHabit = existingHabitRequest.result;
            if (existingHabit) {
              if (areObjectsEqual(existingHabit, habit)) {
                habitsExisted++;
                res();
                return;
              }
              habitsUpdated++;
            } else {
              habitsCreated++;
            }
            const putRequest = habitsStore.put(habit);
            putRequest.onsuccess = () => res();
            putRequest.onerror = () => rej(putRequest.error);
          };
          existingHabitRequest.onerror = () => rej(existingHabitRequest.error);
        });
      }
      for (const action of actions) {
        if (!action[ACTION_COLUMNS.HABIT_ID] || !action[ACTION_COLUMNS.CREATED_AT]) {
          continue;
        }
        const actionKey = [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]];
        const existingActionRequest = actionsStore.get(actionKey);
        await new Promise((res, rej) => {
          existingActionRequest.onsuccess = async () => {
            const existingAction = existingActionRequest.result;
            if (existingAction) {
              if (areObjectsEqual(existingAction, action)) {
                actionsExisted++;
                res();
                return;
              }
              actionsUpdated++;
            } else {
              actionsCreated++;
            }
            const putRequest = actionsStore.put(action);
            putRequest.onsuccess = () => res();
            putRequest.onerror = () => rej(putRequest.error);
          };
          existingActionRequest.onerror = () => rej(existingActionRequest.error);
        });
      }
      tx.oncomplete = () => {
        db.close();
        resolve({
          habitsCreated,
          habitsUpdated,
          habitsExisted,
          actionsCreated,
          actionsUpdated,
          actionsExisted
        });
      };
      tx.onerror = () => reject(tx.error);
    } catch (error) {
      reject(error);
    }
  });
};
