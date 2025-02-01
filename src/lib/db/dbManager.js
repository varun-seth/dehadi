import Dexie from 'dexie';
import { DB_NAME, DB_VERSION, STORES, HABIT_COLUMNS, ACTION_COLUMNS, INDEXES } from './constants.js';

// Create a singleton Dexie database instance
class HabitTrackerDB extends Dexie {
    constructor() {
        super(DB_NAME);

        // Version 3: Previous schema (no 'done' column)
        this.version(3).stores({
            [STORES.HABITS]: `&${HABIT_COLUMNS.ID}, ${HABIT_COLUMNS.NAME}, ${HABIT_COLUMNS.CREATED_AT}, ${HABIT_COLUMNS.UPDATED_AT}, ${HABIT_COLUMNS.RANK}`,
            [STORES.ACTIONS]: `&[${ACTION_COLUMNS.HABIT_ID}+${ACTION_COLUMNS.CREATED_AT}], ${ACTION_COLUMNS.DATE}, [${ACTION_COLUMNS.HABIT_ID}+${ACTION_COLUMNS.DATE}]`
        });

        // Version 4: Add 'done' column to actions table
        this.version(4).stores({
            [STORES.HABITS]: `&${HABIT_COLUMNS.ID}, ${HABIT_COLUMNS.NAME}, ${HABIT_COLUMNS.CREATED_AT}, ${HABIT_COLUMNS.UPDATED_AT}, ${HABIT_COLUMNS.RANK}`,
            [STORES.ACTIONS]: `&[${ACTION_COLUMNS.HABIT_ID}+${ACTION_COLUMNS.CREATED_AT}], ${ACTION_COLUMNS.DATE}, ${ACTION_COLUMNS.DONE}, [${ACTION_COLUMNS.HABIT_ID}+${ACTION_COLUMNS.DATE}]`
        }).upgrade(async (tx) => {
            // Migration for database version 4: Add 'done' column to actions table
            // Sets done=true for all existing action records (which represented completions)
            await tx.table(STORES.ACTIONS).toCollection().modify(action => {
                action[ACTION_COLUMNS.DONE] = true;
            });
        });
    }
}

// Create singleton instance
const db = new HabitTrackerDB();

// Export the database instance
export { db };

// Export a function to get the database instance (for compatibility)
export const getDB = () => db;

// Export a function to check if database is ready
export const isDBReady = async () => {
    try {
        await db.open();
        return true;
    } catch (error) {
        console.error('Database not ready:', error);
        return false;
    }
};

// Export a function to ensure database is open (reopen if necessary)
export const ensureDBOpen = async () => {
    if (!db.isOpen()) {
        try {
            await db.open();
        } catch (error) {
            console.error('Failed to open database:', error);
            throw error;
        }
    }
};

// Utility function to execute database operations with retry on connection errors
export const executeWithRetry = async (operation, maxRetries = 3) => {
    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            await ensureDBOpen();
            return await operation();
        } catch (error) {
            lastError = error;
            if (error.name === 'DatabaseClosedError' || error.message.includes('Connection to Indexed Database server lost')) {
                console.warn(`Database operation failed (attempt ${attempt + 1}/${maxRetries}), retrying...`, error);
                // Close and reopen on next attempt
                if (db.isOpen()) {
                    db.close();
                }
                continue;
            } else {
                // For other errors, don't retry
                throw error;
            }
        }
    }
    throw lastError;
};

// Export a function to close the database connection
export const closeDB = () => {
    if (db.isOpen()) {
        db.close();
    }
};