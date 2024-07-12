export class Clock {
    constructor() {
        this.clockElement = document.getElementById("clock");
        this.dateElement = this.clockElement.querySelector(".date");
        this.timeElement = this.clockElement.querySelector(".time");

        this.week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        this.currentDate = new Date();

        this.update(this.currentDate);
    }

    update(date) {
        this.timeElement.textContent = this.zeroPadding(date.getHours(), 2) + ':' + this.zeroPadding(date.getMinutes(), 2) + ':' + this.zeroPadding(date.getSeconds(), 2);
        this.dateElement.textContent = this.zeroPadding(date.getFullYear(), 4) + '-' + this.zeroPadding(date.getMonth() + 1, 2) + '-' + this.zeroPadding(date.getDate(), 2) + ' ' + this.week[date.getDay()];
    }

    zeroPadding(num, digit) {
        return num.toString().padStart(digit, '0');
    }
}
