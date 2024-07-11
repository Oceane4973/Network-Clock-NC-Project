document.addEventListener("DOMContentLoaded", function() {
    function initializeClockAndTerminal() {
        const clockElement = document.getElementById("clock");
        const dateElement = clockElement.querySelector(".date");
        const timeElement = clockElement.querySelector(".time");

        const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        setInterval(updateTime, 1000);
        updateTime();

        function updateTime() {
            const cd = new Date();
            timeElement.textContent = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
            dateElement.textContent = zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth() + 1, 2) + '-' + zeroPadding(cd.getDate(), 2) + ' ' + week[cd.getDay()];
        }

        function zeroPadding(num, digit) {
            return num.toString().padStart(digit, '0');
        }

        const promptElement = document.querySelector('.prompt');
        const historyElement = document.querySelector('.history');
        const terminalElement = document.querySelector('.terminal');
        const terminalWindowElement = document.querySelector('.terminal-window');

        promptElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const command = promptElement.innerText.trim();

                if (command) {
                    // Append command to history
                    const commandElement = document.createElement('div');
                    commandElement.textContent = `$ ${command}`;
                    historyElement.appendChild(commandElement);

                    // Check command existence (simulated)
                    const resultElement = document.createElement('div');
                    resultElement.textContent = 'Elle existe';
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
            }
        });

        // Set initial focus on the prompt
        promptElement.focus();

        // Focus the prompt element when the terminal window is clicked
        terminalWindowElement.addEventListener('click', () => {
            promptElement.focus();
        });
    }

    initializeClockAndTerminal();
});
