import { Clock } from './modules/clock.js';
import { CommandHandler } from './modules/commandHandler.js';
import { Terminal } from './modules/terminal.js';

document.addEventListener('DOMContentLoaded', () => {
    const clock = new Clock();
    const commandHandler = new CommandHandler(clock);
    const terminal = new Terminal(commandHandler);
});
