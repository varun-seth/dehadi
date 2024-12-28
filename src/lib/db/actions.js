import { openDB } from './openDB.js';
import { STORES, ACTION_COLUMNS, INDEXES } from './constants.js';

export const toggleHabitForDate = async (habitId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORES.ACTIONS, 'readwrite');
      const store = tx.objectStore(STORES.ACTIONS);
      const index = store.index(INDEXES.ACTIONS.DATE_HABIT);
      const request = index.getAll(IDBKeyRange.only([date, habitId]));
      request.onsuccess = async () => {
        try {
          const existingActions = request.result || [];
          if (existingActions.length > 0) {
            for (const action of existingActions) {
              const deleteRequest = store.delete([action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]]);
              await new Promise((res, rej) => {
                deleteRequest.onsuccess = () => res();
                deleteRequest.onerror = () => rej(deleteRequest.error);
              });
            }
            resolve(false);
          } else {
            const now = new Date().toISOString();
            const action = {
              [ACTION_COLUMNS.HABIT_ID]: habitId,
              [ACTION_COLUMNS.CREATED_AT]: now,
              [ACTION_COLUMNS.DATE]: date
            };
            const addRequest = store.add(action);
            await new Promise((res, rej) => {
              addRequest.onsuccess = () => res();
              addRequest.onerror = () => rej(addRequest.error);
            });
            resolve(true);
          }
        } catch (err) {
          reject(err);
        }
      };
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => reject(tx.error);
    } catch (error) {
      reject(error);
    }
  });
};

export const getActionsForDate = async (date) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ACTIONS, 'readonly');
    const store = tx.objectStore(STORES.ACTIONS);
    const index = store.index(INDEXES.ACTIONS.DATE_HABIT);
    const request = index.getAll(IDBKeyRange.bound(
      [date, '0'.padStart(20, '0')],
      [date, '9'.padStart(20, '9')]
    ));
    request.onsuccess = () => {
      const actions = request.result || [];
      resolve(actions.map(action => [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]]));
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const getActionsBetweenDates = async (startDate, endDate) => {
  const db = await openDB();
  const tx = db.transaction(STORES.ACTIONS, 'readonly');
  const store = tx.objectStore(STORES.ACTIONS);
  const index = store.index(INDEXES.ACTIONS.DATE_HABIT);
  return await index.getAll(IDBKeyRange.bound(
    [startDate, '0'.padStart(20, '0')],
    [endDate, '9'.padStart(20, '9')]
  ));
};

export const isHabitCompletedForDate = async (habitId, date) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ACTIONS, 'readonly');
    const store = tx.objectStore(STORES.ACTIONS);
    const index = store.index(INDEXES.ACTIONS.DATE_HABIT);
    const request = index.getAll(IDBKeyRange.only([date, habitId]));
    request.onsuccess = () => {
      const actions = request.result || [];
      resolve(actions.length > 0);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};
