export class Terminal {
    constructor(commandHandler) {
        this.commandHandler = commandHandler;
        this.promptElement = document.querySelector('.prompt');
        this.historyElement = document.querySelector('.history');
        this.terminalElement = document.querySelector('.terminal');
        this.terminalWindowElement = document.querySelector('.terminal-window');

        this.initializeEventListeners();
        this.setInitialFocus();
        this.autoTypeCommand('nc --help');
    }

    initializeEventListeners() {
        this.promptElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const command = this.promptElement.innerText.trim();
                if (command) {
                    this.executeCommand(command);
                }
            }
        });

        this.terminalWindowElement.addEventListener('click', () => {
            this.promptElement.focus();
        });
    }

    executeCommand(command) {
        try {
            if (this.isMaliciousCommand(command)) {
                this.appendToHistory(this.sanitizeOutput(`$ ${command.replace(/\n/g, '&#10;')}`), 'result');
                this.appendToHistory('Invalid or potentially dangerous command detected.');
                this.clearPrompt();
                return;
            }

            this.appendToHistory(`$ ${command}`);

            const result = this.commandHandler.handleCommand(command);
            if (typeof result === 'string') {
                if (command == "nc --help") {
                    this.appendToHistory(result, 'result');
                } else {
                    this.appendToHistory(this.sanitizeOutput(result.replace(/\n/g, '&#10;')), 'result');
                }
            } else {
                this.appendToHistory('Command did not return a string result.', 'result');
            }

            this.clearPrompt();
            this.scrollToBottom();
            this.focusPrompt();
        } catch (error) {
            console.error('Error executing command:', error);
            this.appendToHistory('An error occurred while executing the command.', 'error');
            this.clearPrompt();
        }
    }

    typeCommand(command, index = 0) {
        if (index < command.length) {
            this.promptElement.innerText += command[index];
            setTimeout(() => {
                this.typeCommand(command, index + 1);
            }, 100); // Adjust typing speed here
        } else {
            this.executeCommand(command);
        }
    }

    setInitialFocus() {
        this.promptElement.focus();
    }

    autoTypeCommand(command) {
        setTimeout(() => {
            this.typeCommand(command);
        }, 200); // Adjust delay before starting typing if necessary
    }

    appendToHistory(content, className = '') {
        const element = document.createElement('div');
        element.textContent = content;
        if (className) {
            element.className = className;
        }
        this.historyElement.appendChild(element);
    }

    clearPrompt() {
        this.promptElement.innerText = '';
    }

    scrollToBottom() {
        this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
    }

    focusPrompt() {
        setTimeout(() => {
            this.promptElement.focus();
        }, 10);
    }

    isMaliciousCommand(command) {
        const parts = command.split(' ');
        const commandName = parts[0];
        const arg = parts[1];

        const commandKeys = Object.keys(this.commandHandler.commands);
        if (commandName === 'nc' && commandKeys.includes(arg)) {
            return false;
        }

        const maliciousPatterns = [
            /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
            /<[^>]+>/g, // Basic HTML tags
            /&[^;]+;/g, // HTML entities
            /[^a-zA-Z0-9 ]/g, // Non-alphanumeric characters
            /rm -rf \//, // Dangerous command example
            /;\s*rm\s+-rf\s+/, // Semi-colon command chaining with dangerous command
            /\b(wget|curl|scp|ftp)\b/, // File transfer commands
            /--/, // Double dash often used in command line injection
            /\|/, // Pipe character used for command chaining
            /\b(base64|eval|exec|system|passthru|shell_exec|popen|proc_open|pcntl_exec)\b/, // Common functions used in code injection
        ];

        return maliciousPatterns.some((pattern) => pattern.test(command));
    }

    sanitizeOutput(output) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
        };
        return output.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
}
