import { initializeClock } from './modules/clock.js';
import { initializeTerminal } from './modules/terminal.js';

document.addEventListener("DOMContentLoaded", function() {
    initializeClock();
    initializeTerminal();
});
