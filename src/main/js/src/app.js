import { Clock } from './modules/clock.js';
import { CommandHandler } from './modules/commandHandler.js';
import { initializeTerminal } from './modules/terminal.js';

document.addEventListener('DOMContentLoaded', () => {
    const clock = new Clock();
    const commandHandler = new CommandHandler(clock);
    initializeTerminal(commandHandler);
});
