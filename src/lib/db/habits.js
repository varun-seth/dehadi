import { openDB } from './openDB.js';
import { STORES, HABIT_COLUMNS } from './constants.js';

const generateId = () => {
  return Math.floor(Math.random() * 9e19).toString().padStart(20, '0');
};

export const createHabit = async (habit) => {
  const db = await openDB();
  const tx = db.transaction(STORES.HABITS, 'readwrite');
  const store = tx.objectStore(STORES.HABITS);
  const now = new Date().toISOString();
  const allHabits = await new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  let maxRank = 0;
  allHabits.forEach(h => {
    const r = h[HABIT_COLUMNS.RANK];
    if (typeof r === 'number' && r > maxRank) maxRank = r;
  });
  const newHabit = {
    [HABIT_COLUMNS.ID]: generateId(),
    [HABIT_COLUMNS.CREATED_AT]: now,
    [HABIT_COLUMNS.UPDATED_AT]: now,
    [HABIT_COLUMNS.RANK]: maxRank + 1,
    ...habit
  };
  await store.add(newHabit);
  return newHabit;
};

export const getHabit = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HABITS, 'readonly');
    const store = tx.objectStore(STORES.HABITS);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const updateHabit = async (id, updates) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HABITS, 'readwrite');
    const store = tx.objectStore(STORES.HABITS);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const habit = getRequest.result;
      if (!habit) {
        reject(new Error('Habit not found'));
        return;
      }
      const updatedHabit = {
        ...habit,
        ...updates,
        [HABIT_COLUMNS.UPDATED_AT]: new Date().toISOString()
      };
      const putRequest = store.put(updatedHabit);
      putRequest.onsuccess = () => resolve(updatedHabit);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const deleteHabit = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORES.HABITS, STORES.ACTIONS], 'readwrite');
    tx.objectStore(STORES.HABITS).delete(id);
    const actionStore = tx.objectStore(STORES.ACTIONS);
    const getAllKeysRequest = actionStore.getAllKeys(IDBKeyRange.bound(
      [id, ''],
      [id, '\uffff']
    ));
    getAllKeysRequest.onsuccess = () => {
      const actionKeys = getAllKeysRequest.result;
      for (const key of actionKeys) {
        actionStore.delete(key);
      }
    };
    getAllKeysRequest.onerror = () => reject(getAllKeysRequest.error);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};

export const getAllHabits = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HABITS, 'readonly');
    const store = tx.objectStore(STORES.HABITS);
    const request = store.getAll();
    request.onsuccess = () => {
      let habits = request.result || [];
      let changed = false;
      habits.forEach((habit, i) => {
        if (typeof habit[HABIT_COLUMNS.RANK] !== 'number') {
          habit[HABIT_COLUMNS.RANK] = i + 1;
          changed = true;
        }
      });
      if (changed) {
        const tx2 = db.transaction(STORES.HABITS, 'readwrite');
        const store2 = tx2.objectStore(STORES.HABITS);
        habits.forEach(habit => {
          store2.put(habit);
        });
      }
      habits.sort((a, b) => (a[HABIT_COLUMNS.RANK] ?? 0) - (b[HABIT_COLUMNS.RANK] ?? 0));
      resolve(habits);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const updateHabitRank = async (id, newRank) => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORES.HABITS, 'readwrite');
    const store = tx.objectStore(STORES.HABITS);
    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const habit = getRequest.result;
      if (!habit) {
        reject(new Error('Habit not found'));
        return;
      }
      habit[HABIT_COLUMNS.RANK] = newRank;
      const putRequest = store.put(habit);
      putRequest.onsuccess = () => resolve(habit);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
    tx.oncomplete = () => dbInstance.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const swapHabitRanks = async (id1, id2) => {
  const dbInstance = await openDB();
  return new Promise((resolve, reject) => {
    const tx = dbInstance.transaction(STORES.HABITS, 'readwrite');
    const store = tx.objectStore(STORES.HABITS);
    const getRequest1 = store.get(id1);
    const getRequest2 = store.get(id2);
    getRequest1.onsuccess = () => {
      const habit1 = getRequest1.result;
      getRequest2.onsuccess = () => {
        const habit2 = getRequest2.result;
        if (!habit1 || !habit2) {
          reject(new Error('One or both habits not found'));
          return;
        }
        const tempRank = habit1[HABIT_COLUMNS.RANK];
        habit1[HABIT_COLUMNS.RANK] = habit2[HABIT_COLUMNS.RANK];
        habit2[HABIT_COLUMNS.RANK] = tempRank;
        const putRequest1 = store.put(habit1);
        const putRequest2 = store.put(habit2);
        putRequest1.onsuccess = () => {
          putRequest2.onsuccess = () => resolve([habit1, habit2]);
          putRequest2.onerror = () => reject(putRequest2.error);
        };
        putRequest1.onerror = () => reject(putRequest1.error);
      };
      getRequest2.onerror = () => reject(getRequest2.error);
    };
    getRequest1.onerror = () => reject(getRequest1.error);
    tx.oncomplete = () => dbInstance.close();
    tx.onerror = () => reject(tx.error);
  });
};
