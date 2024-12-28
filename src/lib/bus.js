// A simple reactive event bus for global events
// Only for habit updates for now

const listeners = {};

export function subscribe(event, callback) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(callback);
  return () => {
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  };
}

export function emit(event, payload) {
  if (!listeners[event]) return;
  listeners[event].forEach(cb => cb(payload));
}

export const HABIT_UPDATED_EVENT = 'habit-updated';
