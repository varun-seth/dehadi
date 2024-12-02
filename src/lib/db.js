const DB_NAME = 'dihadi';
const DB_VERSION = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create habits store
      if (!db.objectStoreNames.contains('habits')) {
        const habitStore = db.createObjectStore('habits', { keyPath: 'id' });
        habitStore.createIndex('name', 'name', { unique: false });
        habitStore.createIndex('created_at', 'created_at', { unique: false });
        habitStore.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // Create actions store
      if (!db.objectStoreNames.contains('actions')) {
        const actionStore = db.createObjectStore('actions', { keyPath: ['habit_id', 'created_at'] });
        actionStore.createIndex('date_habit', ['date', 'habit_id'], { unique: false });
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
  const tx = db.transaction('habits', 'readwrite');
  const store = tx.objectStore('habits');
  
  const now = new Date().toISOString();
  const newHabit = {
    id: generateId(),
    created_at: now,
    updated_at: now,
    ...habit
  };
  
  await store.add(newHabit);
  return newHabit;
};

export const getHabit = async (id) => {
  const db = await openDB();
  const tx = db.transaction('habits', 'readonly');
  const store = tx.objectStore('habits');
  return await store.get(id);
};

export const updateHabit = async (id, updates) => {
  const db = await openDB();
  const tx = db.transaction('habits', 'readwrite');
  const store = tx.objectStore('habits');
  
  const habit = await store.get(id);
  if (!habit) throw new Error('Habit not found');
  
  const updatedHabit = {
    ...habit,
    ...updates,
    updated_at: new Date().toISOString()
  };
  
  await store.put(updatedHabit);
  return updatedHabit;
};

export const deleteHabit = async (id) => {
  const db = await openDB();
  const tx = db.transaction(['habits', 'actions'], 'readwrite');
  
  // Delete the habit
  await tx.objectStore('habits').delete(id);
  
  // Delete all associated actions
  const actionStore = tx.objectStore('actions');
  const actionIndex = actionStore.index('date_habit');
  const actionKeys = await actionIndex.getAllKeys(IDBKeyRange.bound(
    [new Date(0), id],
    [new Date(8640000000000000), id]
  ));
  
  for (const key of actionKeys) {
    await actionStore.delete(key);
  }
};

export const getAllHabits = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('habits', 'readonly');
    const store = tx.objectStore('habits');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

// Actions operations
export const toggleHabitForDate = async (habitId, date) => {
  const db = await openDB();
  const tx = db.transaction('actions', 'readwrite');
  const store = tx.objectStore('actions');
  const index = store.index('date_habit');

  // Check if action exists for this habit and date
  const existingActions = await index.getAllKeys(IDBKeyRange.only([date, habitId]));
  
  if (existingActions.length > 0) {
    // If action exists, delete it (untoggle)
    for (const key of existingActions) {
      await store.delete(key);
    }
    return false;
  } else {
    // If no action exists, create one (toggle on)
    const now = new Date().toISOString();
    await store.add({
      habit_id: habitId,
      date: date,
      created_at: now
    });
    return true;
  }
};

export const getActionsForDate = async (date) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('actions', 'readonly');
    const store = tx.objectStore('actions');
    const index = store.index('date_habit');
    
    const request = index.getAllKeys(IDBKeyRange.bound(
      [date, '0'.padStart(20, '0')],
      [date, '9'.padStart(20, '9')]
    ));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
    
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
};

export const getActionsBetweenDates = async (startDate, endDate) => {
  const db = await openDB();
  const tx = db.transaction('actions', 'readonly');
  const store = tx.objectStore('actions');
  const index = store.index('date_habit');
  
  return await index.getAll(IDBKeyRange.bound(
    [startDate, '0'.padStart(20, '0')],
    [endDate, '9'.padStart(20, '9')]
  ));
};