import { useState, useEffect } from 'react';
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

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    refresh: loadHabits
  };
};

export const useHabitActions = (date) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (date) {
      loadActions();
    }
  }, [date]);

  const loadActions = async () => {
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
  };

  const toggleHabit = async (habitId) => {
    try {
      console.log('Toggling habit:', habitId, 'for date:', date);
      const isCompleted = await db.toggleHabitForDate(habitId, date);
      console.log('Toggle result:', isCompleted);
      await loadActions(); // Refresh actions after toggle
      return isCompleted;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    actions,
    loading,
    error,
    toggleHabit,
    refresh: loadActions
  };
};