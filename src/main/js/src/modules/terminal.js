export class Terminal {
    constructor(commandHandler) {
        this.commandHandler = commandHandler;
        this.promptElement = document.querySelector('.prompt');
        this.historyElement = document.querySelector('.history');
        this.terminalElement = document.querySelector('.terminal');
        this.terminalWindowElement = document.querySelector('.terminal-window');

        this.initializeEventListeners()
            .then(() => {
                this.setInitialFocus();
                return this.autoTypeCommand('nc --help');
            })
            .catch(error => {
                console.error('Error initializing event listeners or auto-typing command:', error);
            });
    }

    async initializeEventListeners() {
        this.promptElement.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const command = this.promptElement.innerText.trim();
                if (command) {
                    await this.executeCommand(command);
                }
            }
        });

        this.terminalWindowElement.addEventListener('click', () => {
            this.promptElement.focus();
        });
    }

    async executeCommand(command) {
        try {
            if (this.isMaliciousCommand(command)) {
                this.appendToHistory(this.sanitizeOutput(`$ ${command.replace(/\n/g, '&#10;')}`), 'result');
                this.appendToHistory('Invalid or potentially dangerous command detected.');
                this.clearPrompt();
                return;
            }

            this.appendToHistory(`$ ${command}`);

            const result = await this.commandHandler.handleCommand(command);
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

    async typeCommand(command, index = 0) {
        if (index < command.length) {
            this.promptElement.innerText += command[index];
            setTimeout(async () => {
                await this.typeCommand(command, index + 1);
            }, 100); // Adjust typing speed here
        } else {
            await this.executeCommand(command);
        }
    }

    setInitialFocus() {
        this.promptElement.focus();
    }

    async autoTypeCommand(command) {
        setTimeout(async () => {
            await this.typeCommand(command);
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
        // Split the command into parts to validate each part
        const parts = command.split(' ');
        const commandName = parts[0];
        const arg = parts[1];

        const commandKeys = Object.keys(this.commandHandler.commands);
        if (commandName === 'nc' && commandKeys.includes(arg)) {
            // Check each subsequent part of the command for malicious patterns
            const maliciousPatterns = [
                /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
                /<[^>]+>/g, // Basic HTML tags
                /&[^;]+;/g, // HTML entities
                /rm -rf \//, // Dangerous command example
                /;\s*rm\s+-rf\s+/, // Semi-colon command chaining with dangerous command
                /\b(wget|curl|scp|ftp)\b/, // File transfer commands
                /\|/, // Pipe character used for command chaining
                /\b(base64|eval|exec|system|passthru|shell_exec|popen|proc_open|pcntl_exec)\b/, // Common functions used in code injection
                /;|&&|\|\|/ // Command chaining characters
            ];

            // Skip the first two parts (command name and first argument) and check the rest
            for (let i = 2; i < parts.length; i++) {
                if (maliciousPatterns.some(pattern => pattern.test(parts[i]))) {
                    return true;
                }
            }

            // If no malicious pattern is found in any part, return false
            return false;
        }

        // If the command is not a known good command, return true
        return true;
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
