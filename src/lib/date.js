
/**
 * Date Service - manages current date state and navigation
 * Completely decoupled from React - uses events
 */

const DATE_CHANGE_EVENT = 'dateChange';
const DATE_REQUEST_EVENT = 'dateRequest';

let currentDate = null;

/**
 * Get today's date as YYYY-MM-DD
 */
export function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days from a date string
 */
function addDays(dateString, days) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    return `${newYear}-${newMonth}-${newDay}`;
}

/**
 * Format date string to human-readable format
 */
function formatDate(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Set the current date and notify all listeners
 */
export function setDate(dateString) {
    currentDate = dateString;
    const event = new CustomEvent(DATE_CHANGE_EVENT, { 
        detail: { date: dateString, formatted: formatDate(dateString) } 
    });
    window.dispatchEvent(event);
}

/**
 * Get the current date
 */
export function getCurrentDate() {
    return currentDate || getTodayString();
}

/**
 * Navigate to previous day
 */
export function previousDay() {
    const newDate = addDays(getCurrentDate(), -1);
    setDate(newDate);
}

/**
 * Navigate to next day
 */
export function nextDay() {
    const newDate = addDays(getCurrentDate(), 1);
    setDate(newDate);
}

/**
 * Subscribe to date changes
 */
export function onDateChange(callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener(DATE_CHANGE_EVENT, handler);
    return () => window.removeEventListener(DATE_CHANGE_EVENT, handler);
}

/**
 * Request current date (for initial load)
 */
export function requestCurrentDate() {
    const event = new CustomEvent(DATE_REQUEST_EVENT);
    window.dispatchEvent(event);
}

/**
 * Listen for date requests and respond
 */
export function onDateRequest(callback) {
    const handler = () => callback(getCurrentDate());
    window.addEventListener(DATE_REQUEST_EVENT, handler);
    return () => window.removeEventListener(DATE_REQUEST_EVENT, handler);
}


// Formats a Date object as YYYY-MM-DD in local time
export function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}