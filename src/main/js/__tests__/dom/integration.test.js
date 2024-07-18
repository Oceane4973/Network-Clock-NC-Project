import { Terminal } from '../../src/modules/terminal.js';
import { CommandHandler } from '../../src/modules/commandHandler';
import { Clock } from '../../src/modules/clock';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

/**
 * Integration tests for the Network Clock application.
 *
 * This test suite verifies the integration between various modules, including Terminal, CommandHandler, and Clock.
 * It ensures that:
 * - All components initialize correctly.
 * - Commands for displaying help, setting time, and setting date formats are handled and displayed properly.
 * - Error handling for invalid date formats is functioning as expected.
 * - The current date format and time can be retrieved and displayed.
 * - Command injection is detected and prevented.
 * - Valid commands are executed without being flagged as malicious.
 *
 * The tests utilize the Jest framework for assertions, with jest-fetch-mock for mocking fetch requests.
 * Each test case is isolated using setup and teardown methods to maintain a clean testing environment.
 */
describe('Integration Test', () => {
    let clock;
    let commandHandler;
    let terminal;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="clock">
                <div class="date"></div>
                <div class="time"></div>
            </div>
            <div class="terminal">
                <div class="history"></div>
                <div class="terminal-window">
                    <div class="prompt" contenteditable="true"></div>
                </div>
            </div>
        `;

        clock = new Clock();
        commandHandler = new CommandHandler(clock);
        terminal = new Terminal(commandHandler);
        fetchMock.resetMocks();
    });

    test('should initialize all components correctly', () => {
        expect(clock).toBeTruthy();
        expect(commandHandler).toBeTruthy();
        expect(terminal).toBeTruthy();
    });

    test('should display help message when nc --help is executed', async () => {
        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --help';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Usage:');
        expect(historyContent).toContain('nc --help');
        expect(historyContent).toContain('nc --set-time');
    });

    test('should set and display the time correctly', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45"';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Date set to: 2023-07-15 12:30:45');

        const timeContent = document.querySelector('.time').textContent;
        expect(timeContent).toBe('12:30:45');
    });

    test('should display an error for invalid date format', async () => {
        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --set-time "yyyy-MM-dd HH:mm:ss" "invalid-date"';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Error: Invalid date format or date value');
    });

    test('should set and display the date format correctly', async () => {
        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --set-format "dd/MM/yyyy HH:mm:ss"';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Date format set to: dd/MM/yyyy HH:mm:ss');
    });

    test('should display the current date format', async () => {
        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --get-format';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Current date format: yyyy-MM-dd HH:mm:ss');
    });

    test('should display the current time', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ currentTime: '2023-07-16T10:00:00Z' }));

        const promptElement = terminal.promptElement;
        promptElement.innerText = 'nc --get-time';
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        promptElement.dispatchEvent(event);

        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async operations

        const historyContent = document.querySelector('.history').textContent;
        expect(historyContent).toContain('Current date:');
    });

    test('should detect command injection', () => {
        const command = 'nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45" ; rm -rf /';
        const isMalicious = terminal.isMaliciousCommand(command);
        expect(isMalicious).toBe(true);
    });

    test('should allow valid command', () => {
        const command = 'nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45"';
        const isMalicious = terminal.isMaliciousCommand(command);
        expect(isMalicious).toBe(false);
    });

    test('should allow valid set-format command', () => {
        const command = 'nc --set-format "dd/MM/yyyy HH:mm:ss"';
        const isMalicious = terminal.isMaliciousCommand(command);
        expect(isMalicious).toBe(false);
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clean up the DOM
    });
});
