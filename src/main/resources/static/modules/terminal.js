import { CommandHandler } from './CommandHandler.js';

export function initializeTerminal() {
    const promptElement = document.querySelector('.prompt');
    const historyElement = document.querySelector('.history');
    const terminalElement = document.querySelector('.terminal');
    const terminalWindowElement = document.querySelector('.terminal-window');
    const commandHandler = new CommandHandler();

    promptElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const command = promptElement.innerText.trim();

            if (command) {
                executeCommand(command);
            }
        }
    });

    function executeCommand(command) {
        // Append command to history
        const commandElement = document.createElement('div');
        commandElement.textContent = `$ ${command}`;
        historyElement.appendChild(commandElement);

        // Process command
        const result = commandHandler.handleCommand(command);
        const resultElement = document.createElement('div');
        resultElement.className = 'result';
        resultElement.innerHTML = result.replace(/\n/g, '&#10;');
        historyElement.appendChild(resultElement);

        // Clear the prompt
        promptElement.innerText = '';

        // Scroll to bottom
        terminalElement.scrollTop = terminalElement.scrollHeight;

        // Move focus back to the prompt
        setTimeout(() => {
            promptElement.focus();
        }, 10);
    }

    function typeCommand(command, index = 0) {
        if (index < command.length) {
            promptElement.innerText += command[index];
            setTimeout(() => {
                typeCommand(command, index + 1);
            }, 100); // Adjust typing speed here
        } else {
            executeCommand(command);
        }
    }

    // Set initial focus on the prompt
    promptElement.focus();

    // Focus the prompt element when the terminal window is clicked
    terminalWindowElement.addEventListener('click', () => {
        promptElement.focus();
    });

    // Automatically type and execute the help command on load
    setTimeout(() => {
        typeCommand('nc --help');
    }, 200); // Adjust delay before starting typing if necessary
}
