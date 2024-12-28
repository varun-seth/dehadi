const DB_NAME = 'dihadi';
const DB_VERSION = 2;

const STORES = {
  HABITS: 'habits',
  ACTIONS: 'actions'
};

const HABIT_COLUMNS = {
  ID: 'id',
  NAME: 'name',
  DESCRIPTION: 'description',
  COLOR: 'color',
  ICON: 'icon',
  RANK: 'rank',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
};

const ACTION_COLUMNS = {
  HABIT_ID: 'habit_id',
  CREATED_AT: 'created_at',
  DATE: 'date'
};

const INDEXES = {
  HABITS: {
    NAME: 'name',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at'
  },
  ACTIONS: {
    DATE_HABIT: 'date_habit'
  }
};

const openDB = () => {
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

// Helper function to generate a 20-digit random ID
const generateId = () => {
  return Math.floor(Math.random() * 9e19).toString().padStart(20, '0');
};

// Habits CRUD operations
export const createHabit = async (habit) => {
  const db = await openDB();
  const tx = db.transaction(STORES.HABITS, 'readwrite');
  const store = tx.objectStore(STORES.HABITS);
  
  const now = new Date().toISOString();
  const count = await store.count();
  const newHabit = {
    [HABIT_COLUMNS.ID]: generateId(),
    [HABIT_COLUMNS.CREATED_AT]: now,
    [HABIT_COLUMNS.UPDATED_AT]: now,
    [HABIT_COLUMNS.RANK]: count + 1,
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
      // Patch missing ranks for legacy rows
      let changed = false;
      habits.forEach((habit, i) => {
        if (typeof habit[HABIT_COLUMNS.RANK] !== 'number') {
          habit[HABIT_COLUMNS.RANK] = i + 1;
          changed = true;
        }
      });
      // Optionally persist patched ranks
      if (changed) {
        const tx2 = db.transaction(STORES.HABITS, 'readwrite');
        const store2 = tx2.objectStore(STORES.HABITS);
        habits.forEach(habit => {
          store2.put(habit);
        });
      }
      // Always return sorted by rank
      habits.sort((a, b) => (a[HABIT_COLUMNS.RANK] ?? 0) - (b[HABIT_COLUMNS.RANK] ?? 0));
      resolve(habits);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

// Helper to update rank for a habit


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

// Helper to swap ranks between two habits
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


// Actions operations
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
          console.log('Found actions:', existingActions);

          if (existingActions.length > 0) {
            for (const action of existingActions) {
              console.log('Deleting action:', [action[ACTION_COLUMNS.HABIT_ID], action[ACTION_COLUMNS.CREATED_AT]]);
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
      console.error('Toggle error:', error);
      reject(error);
    }
  });
};export const getActionsForDate = async (date) => {
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

export const getMonthlyScores = async (year, month) => {
  const db = await openDB();
  
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  
  return new Promise(async (resolve, reject) => {
    try {
      const habitsTx = db.transaction(STORES.HABITS, 'readonly');
      const habitsStore = habitsTx.objectStore(STORES.HABITS);
      const habitsRequest = habitsStore.getAll();
      
      habitsRequest.onsuccess = async () => {
        const habits = habitsRequest.result || [];
        const totalHabits = habits.length;
        
        if (totalHabits === 0) {
          const scores = {};
          for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            scores[dateStr] = 0;
          }
          resolve(scores);
          return;
        }
        
        const actionsTx = db.transaction(STORES.ACTIONS, 'readonly');
        const actionsStore = actionsTx.objectStore(STORES.ACTIONS);
        const actionsIndex = actionsStore.index(INDEXES.ACTIONS.DATE_HABIT);
        
        const actionsRequest = actionsIndex.getAll(IDBKeyRange.bound(
          [startDate, '0'.padStart(20, '0')],
          [endDate, '9'.padStart(20, '9')]
        ));
        
        actionsRequest.onsuccess = () => {
          const actions = actionsRequest.result || [];
          
          const completionsByDate = {};
          actions.forEach(action => {
            const date = action[ACTION_COLUMNS.DATE];
            if (!completionsByDate[date]) {
              completionsByDate[date] = new Set();
            }
            completionsByDate[date].add(action[ACTION_COLUMNS.HABIT_ID]);
          });
          
          const scores = {};
          for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const completedCount = completionsByDate[dateStr]?.size || 0;
            scores[dateStr] = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
          }
          
          resolve(scores);
        };
        
        actionsRequest.onerror = () => reject(actionsRequest.error);
      };
      
      habitsRequest.onerror = () => reject(habitsRequest.error);
    } catch (error) {
      reject(error);
    }
  });
};

export const calculatePaceForHabit = async (habitId) => {
  const db = await openDB();
  
  return new Promise(async (resolve, reject) => {
    const habitTx = db.transaction(STORES.HABITS, 'readonly');
    const habitStore = habitTx.objectStore(STORES.HABITS);
    const habitRequest = habitStore.get(habitId);
    
    habitRequest.onsuccess = async () => {
      const habit = habitRequest.result;
      if (!habit) {
        resolve(0);
        return;
      }
      
      const habitCreatedDate = new Date(habit[HABIT_COLUMNS.CREATED_AT]);
      habitCreatedDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const actionsTx = db.transaction(STORES.ACTIONS, 'readonly');
      const actionsStore = actionsTx.objectStore(STORES.ACTIONS);
      
      const actionsRequest = actionsStore.getAll(IDBKeyRange.bound(
        [habitId, ''],
        [habitId, '\uffff']
      ));
      
      actionsRequest.onsuccess = () => {
        const actions = actionsRequest.result || [];
        
        if (actions.length === 0) {
          resolve(0);
          return;
        }
        
        const uniqueDates = new Set();
        let earliestActionDate = null;
        
        actions.forEach(action => {
          uniqueDates.add(action[ACTION_COLUMNS.DATE]);
          
          const actionDate = new Date(action[ACTION_COLUMNS.DATE]);
          if (!earliestActionDate || actionDate < earliestActionDate) {
            earliestActionDate = actionDate;
          }
        });
        
        const startDate = earliestActionDate < habitCreatedDate ? earliestActionDate : habitCreatedDate;
        const daysSinceCreation = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        const daysCompleted = uniqueDates.size;
        const pace = daysSinceCreation > 0 ? (daysCompleted / daysSinceCreation) * 100 : 0;
        
        resolve(Math.round(pace * 10) / 10);
      };
      
      actionsRequest.onerror = () => reject(actionsRequest.error);
    };
    
    habitRequest.onerror = () => reject(habitRequest.error);
  });
};

export const getTotalHabitsCount = async () => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.HABITS, 'readonly');
    const store = tx.objectStore(STORES.HABITS);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const getTotalActionsCount = async () => {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.ACTIONS, 'readonly');
    const store = tx.objectStore(STORES.ACTIONS);
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
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
          console.warn('Skipping habit without ID:', habit);
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
          console.warn('Skipping action without habit_id or created_at:', action);
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