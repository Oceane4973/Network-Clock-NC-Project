export function initializeClock() {
    const clockElement = document.getElementById("clock");
    const dateElement = clockElement.querySelector(".date");
    const timeElement = clockElement.querySelector(".time");

    const week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const currentDate = new Date();

    updateClock(currentDate);

    function updateClock(date) {
        timeElement.textContent = zeroPadding(date.getHours(), 2) + ':' + zeroPadding(date.getMinutes(), 2) + ':' + zeroPadding(date.getSeconds(), 2);
        dateElement.textContent = zeroPadding(date.getFullYear(), 4) + '-' + zeroPadding(date.getMonth() + 1, 2) + '-' + zeroPadding(date.getDate(), 2) + ' ' + week[date.getDay()];
    }

    function zeroPadding(num, digit) {
        return num.toString().padStart(digit, '0');
    }

    return {
        update: updateClock
    };
}
