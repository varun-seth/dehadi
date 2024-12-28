import { DB_NAME, DB_VERSION, STORES, HABIT_COLUMNS, ACTION_COLUMNS, INDEXES } from './constants.js';

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains(STORES.HABITS)) {
        const habitStore = db.createObjectStore(STORES.HABITS, { keyPath: HABIT_COLUMNS.ID });
        habitStore.createIndex(INDEXES.HABITS.NAME, HABIT_COLUMNS.NAME, { unique: false });
        habitStore.createIndex(INDEXES.HABITS.CREATED_AT, HABIT_COLUMNS.CREATED_AT, { unique: false });
        habitStore.createIndex(INDEXES.HABITS.UPDATED_AT, HABIT_COLUMNS.UPDATED_AT, { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ACTIONS)) {
        const actionStore = db.createObjectStore(STORES.ACTIONS, { 
          keyPath: [ACTION_COLUMNS.HABIT_ID, ACTION_COLUMNS.CREATED_AT] 
        });
        actionStore.createIndex(
          INDEXES.ACTIONS.DATE_HABIT, 
          [ACTION_COLUMNS.DATE, ACTION_COLUMNS.HABIT_ID], 
          { unique: false }
        );
      }
    };
  });
};
