import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db, getDB, isDBReady, ensureDBOpen, executeWithRetry, closeDB } from '../dbManager.js';
import { clearDB } from './testHelpers.js';

describe('dbManager', () => {
    afterEach(async () => {
        await closeDB();
    });

    describe('getDB', () => {
        it('returns the database instance', () => {
            const dbInstance = getDB();
            expect(dbInstance).toBe(db);
        });
    });

    describe('isDBReady', () => {
        it('returns true when database is ready', async () => {
            const ready = await isDBReady();
            expect(ready).toBe(true);
        });
    });

    describe('ensureDBOpen', () => {
        it('opens the database if not open', async () => {
            await closeDB();
            expect(db.isOpen()).toBe(false);
            await ensureDBOpen();
            expect(db.isOpen()).toBe(true);
        });

        it('does nothing if database is already open', async () => {
            await ensureDBOpen();
            expect(db.isOpen()).toBe(true);
            await ensureDBOpen();
            expect(db.isOpen()).toBe(true);
        });
    });

    describe('executeWithRetry', () => {
        beforeEach(async () => {
            await clearDB();
        });

        it('executes operation successfully', async () => {
            const result = await executeWithRetry(async () => {
                return 'success';
            });
            expect(result).toBe('success');
        });

        it('retries on DatabaseClosedError', async () => {
            let attempts = 0;
            const result = await executeWithRetry(async () => {
                attempts++;
                if (attempts === 1) {
                    // Simulate database closed error on first attempt
                    const error = new Error('Connection to Indexed Database server lost');
                    error.name = 'DatabaseClosedError';
                    throw error;
                }
                return 'success';
            });
            expect(result).toBe('success');
            expect(attempts).toBe(2);
        });

        it('throws error after max retries', async () => {
            let attempts = 0;
            await expect(executeWithRetry(async () => {
                attempts++;
                const error = new Error('Connection to Indexed Database server lost');
                error.name = 'DatabaseClosedError';
                throw error;
            }, 2)).rejects.toThrow('Connection to Indexed Database server lost');
            expect(attempts).toBe(2);
        });

        it('does not retry on other errors', async () => {
            let attempts = 0;
            await expect(executeWithRetry(async () => {
                attempts++;
                throw new Error('Other error');
            })).rejects.toThrow('Other error');
            expect(attempts).toBe(1);
        });
    });

    describe('closeDB', () => {
        it('closes the database connection', async () => {
            await ensureDBOpen();
            expect(db.isOpen()).toBe(true);
            closeDB();
            expect(db.isOpen()).toBe(false);
        });

        it('does nothing if database is already closed', () => {
            closeDB();
            expect(db.isOpen()).toBe(false);
            closeDB();
            expect(db.isOpen()).toBe(false);
        });
    });
});