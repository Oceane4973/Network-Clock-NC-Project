// src/main/js/__tests__/commandHandler.test.js

import { CommandHandler } from '../../src/modules/commandHandler';
import { Clock } from '../../src/modules/clock';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('CommandHandler', () => {
    let clock;
    let handler;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="clock">
                <div class="date"></div>
                <div class="time"></div>
            </div>
        `;
        clock = new Clock();
        handler = new CommandHandler(clock);
        fetchMock.resetMocks();
    });

    test('should show help message with --help command', async () => {
        const result = await handler.handleCommand('nc --help');
        expect(result).toContain('Usage:');
    });

    test('should set the date and time with --set-time command', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 })

        const result = await handler.handleCommand('nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45"');
        expect(result).toBe('Date set to: 2023-07-15 12:30:45');
        expect(handler.currentDate).toEqual(new Date(2023, 6, 15, 12, 30, 45));
    });

    test('should return error with invalid date format in --set-time', async () => {
        const result = await handler.handleCommand('nc --set-time "yyyy-MM-dd HH:mm:ss" "invalid-date"');
        expect(result).toBe('Error: Invalid date format or date value');
    });

    test('should set the date format with --set-format command', async () => {
        const result = await handler.handleCommand('nc --set-format "dd/MM/yyyy HH:mm:ss"');
        expect(result).toBe('Date format set to: dd/MM/yyyy HH:mm:ss');
        expect(handler.currentDateFormat).toBe('dd/MM/yyyy HH:mm:ss');
    });

    test('should return error with invalid date format in --set-format', async () => {
        const result = await handler.handleCommand('nc --set-format "invalid-format"');
        expect(result).toBe('Error: Invalid date format');
    });

    test('should get the current date format with --get-format command', async () => {
        const result = await handler.handleCommand('nc --get-format');
        expect(result).toBe('Current date format: yyyy-MM-dd HH:mm:ss');
    });

    test('should get the current date with --get-time command', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ currentTime: '2023-07-16T10:00:00Z' }));

        const result = await handler.handleCommand('nc --get-time');
        expect(result).toContain('Current date:');
    });

    test('should handle unknown command gracefully', async () => {
        const result = await handler.handleCommand('nc --unknown-command');
        expect(result).toBe('Unknown command: --unknown-command');
    });
});
