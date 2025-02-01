import { db, executeWithRetry } from './dbManager.js';
import { STORES, HABIT_COLUMNS, ACTION_COLUMNS, INDEXES } from './constants.js';

export const getMonthlyScores = async (year, month) => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return await executeWithRetry(async () => {
    return await db.transaction('r', db.habits, db.actions, async () => {
      const habits = await db.habits.toArray();
      const totalHabits = habits.length;
      if (totalHabits === 0) {
        const scores = {};
        for (let day = 1; day <= lastDay; day++) {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          scores[dateStr] = 0;
        }
        return scores;
      }

      const actions = await db.actions.where(ACTION_COLUMNS.DATE).between(startDate, endDate).toArray();
      const completionsByDate = {};
      actions.forEach(action => {
        if (action[ACTION_COLUMNS.DONE] === true) {
          const date = action[ACTION_COLUMNS.DATE];
          if (!completionsByDate[date]) {
            completionsByDate[date] = new Set();
          }
          completionsByDate[date].add(action[ACTION_COLUMNS.HABIT_ID]);
        }
      });
      const scores = {};
      for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const completedCount = completionsByDate[dateStr]?.size || 0;
        scores[dateStr] = totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0;
      }
      return scores;
    });
  });
};

export const calculatePaceForHabit = async (habitId) => {
  return await executeWithRetry(async () => {
    const habit = await db.habits.get(habitId);
    if (!habit) {
      return 0;
    }
    const habitCreatedDate = new Date(habit[HABIT_COLUMNS.CREATED_AT]);
    habitCreatedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const actions = await db.actions.where(ACTION_COLUMNS.HABIT_ID).equals(habitId).toArray();
    if (actions.length === 0) {
      return 0;
    }
    const uniqueDates = new Set();
    let earliestActionDate = null;
    actions.forEach(action => {
      if (action[ACTION_COLUMNS.DONE] === true) {
        uniqueDates.add(action[ACTION_COLUMNS.DATE]);
        const actionDate = new Date(action[ACTION_COLUMNS.DATE]);
        if (!earliestActionDate || actionDate < earliestActionDate) {
          earliestActionDate = actionDate;
        }
      }
    });
    const startDate = earliestActionDate < habitCreatedDate ? earliestActionDate : habitCreatedDate;
    const daysSinceCreation = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const daysCompleted = uniqueDates.size;
    const pace = daysSinceCreation > 0 ? (daysCompleted / daysSinceCreation) * 100 : 0;
    return Math.round(pace * 10) / 10;
  });
};
