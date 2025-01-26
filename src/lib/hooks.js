import { useState, useEffect, useCallback } from 'react';
import * as db from './db';

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const habits = await db.getAllHabits();
      setHabits(habits || []);
      setError(null);
    } catch (err) {
      console.error('Error loading habits:', err);
      setError(err.message);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habit) => {
    try {
      const newHabit = await db.createHabit(habit);
      setHabits([...habits, newHabit]);
      return newHabit;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateHabit = async (id, updates) => {
    try {
      const updatedHabit = await db.updateHabit(id, updates);
      setHabits(habits.map(h => h.id === id ? updatedHabit : h));
      return updatedHabit;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteHabit = async (id) => {
    try {
      await db.deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Drag-and-drop helpers
  const swapHabitRanks = async (id1, id2) => {
    await db.swapHabitRanks(id1, id2);
    await loadHabits();
  };
  const updateHabitRank = async (id, newRank) => {
    await db.updateHabitRank(id, newRank);
    await loadHabits();
  };
  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    refresh: loadHabits,
    swapHabitRanks,
    updateHabitRank
  };
};

export const useHabitActions = (date) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadActions = useCallback(async () => {
    try {
      setLoading(true);
      const actions = await db.getActionsForDate(date);
      setActions(actions || []);
      setError(null);
    } catch (err) {
      console.error('Error loading actions:', err);
      setError(err.message);
      setActions([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      loadActions();
    }
  }, [date, loadActions]);

  const toggleHabit = useCallback(async (habitId, desiredState) => {
    try {
      console.log('Setting habit:', habitId, 'for date:', date, 'to:', desiredState);
      const newState = await db.toggleHabitForDate(habitId, date, desiredState);
      console.log('Set result:', newState);
      await loadActions();
      return newState;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [date, loadActions]);

  return {
    actions,
    loading,
    error,
    toggleHabit,
    refresh: loadActions
  };
};