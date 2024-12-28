import { openDB } from './openDB.js';
import { STORES, HABIT_COLUMNS, ACTION_COLUMNS, INDEXES } from './constants.js';

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
