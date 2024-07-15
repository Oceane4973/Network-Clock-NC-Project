// src/main/js/__tests__/commandHandler.test.js

import { CommandHandler } from '../../src/modules/commandHandler';
import { Clock } from '../../src/modules/clock';

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
    });

    test('should show help message with --help command', () => {
        const result = handler.handleCommand('nc --help');
        expect(result).toContain('Usage:');
    });

    test('should set the date and time with --set-time command', () => {
        const result = handler.handleCommand('nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45"');
        expect(result).toBe('Date set to: 2023-07-15 12:30:45');
        expect(handler.currentDate).toEqual(new Date(2023, 6, 15, 12, 30, 45));
    });

    test('should return error with invalid date format in --set-time', () => {
        const result = handler.handleCommand('nc --set-time "yyyy-MM-dd HH:mm:ss" "invalid-date"');
        expect(result).toBe('Error: Invalid date format or date value');
    });

    test('should set the date format with --set-format command', () => {
        const result = handler.handleCommand('nc --set-format "dd/MM/yyyy HH:mm:ss"');
        expect(result).toBe('Date format set to: dd/MM/yyyy HH:mm:ss');
        expect(handler.currentDateFormat).toBe('dd/MM/yyyy HH:mm:ss');
    });

    test('should return error with invalid date format in --set-format', () => {
        const result = handler.handleCommand('nc --set-format "invalid-format"');
        expect(result).toBe('Error: Invalid date format');
    });

    test('should get the current date format with --get-format command', () => {
        const result = handler.handleCommand('nc --get-format');
        expect(result).toBe('Current date format: yyyy-MM-dd HH:mm:ss');
    });

    test('should get the current date with --get-time command', () => {
        const result = handler.handleCommand('nc --get-time');
        const formattedDate = handler.formatDate(handler.currentDate, handler.currentDateFormat);
        expect(result).toBe(`Current date: ${formattedDate}`);
    });

    test('should handle unknown command', () => {
        const result = handler.handleCommand('nc --unknown-command');
        expect(result).toBe('Unknown command: --unknown-command');
    });

    test('should handle command not found', () => {
        const result = handler.handleCommand('unknown-command');
        expect(result).toBe('Command not found: unknown-command');
    });

    test('splitArgs should correctly split arguments', () => {
        const command = 'nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45"';
        const args = handler.splitArgs(command);
        expect(args).toEqual(['nc', '--set-time', 'yyyy-MM-dd HH:mm:ss', '2023-07-15 12:30:45']);
    });

    test('parseDate should return null for invalid date string', () => {
        const date = handler.parseDate('invalid-date', 'yyyy-MM-dd HH:mm:ss');
        expect(date).toBeNull();
    });

    test('parseDate should correctly parse valid date string', () => {
        const dateStr = '2023-07-15 12:30:45';
        const format = 'yyyy-MM-dd HH:mm:ss';
        const date = handler.parseDate(dateStr, format);
        expect(date).toEqual(new Date(2023, 6, 15, 12, 30, 45));
    });

    test('formatDate should correctly format date', () => {
        const date = new Date(2023, 6, 15, 12, 30, 45);
        const format = 'yyyy-MM-dd HH:mm:ss';
        const formattedDate = handler.formatDate(date, format);
        expect(formattedDate).toBe('2023-07-15 12:30:45');
    });

    test('should throw error if date elements are missing in the DOM', () => {
        document.body.innerHTML = `<div id="clock"></div>`;
        expect(() => new Clock()).toThrow('Clock elements are not found');
    });

    test('should handle performance within acceptable limits', () => {
        const start = performance.now();
        handler.handleCommand('nc --get-time');
        const end = performance.now();
        expect(end - start).toBeLessThan(50); // The operation should take less than 50ms
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clean up the DOM
    });
});
