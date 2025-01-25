import { db, ensureDBOpen } from './dbManager.js';

export const openDB = async () => {
    await ensureDBOpen();
    return db;
};