// src/main/js/__tests__/dom/clock.test.js

import { Clock } from '../../src/modules/clock';

describe('Clock', () => {
    let clockElement;
    let clock;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="clock">
                <div class="date"></div>
                <div class="time"></div>
            </div>
        `;
        clockElement = document.getElementById('clock');
        clock = new Clock();
    });

    test('should update the time and date elements', () => {
        const testDate = new Date(2023, 6, 15, 12, 30, 45); // 15 July 2023, 12:30:45
        clock.update(testDate);

        expect(clockElement.querySelector('.time').textContent).toBe('12:30:45');
        expect(clockElement.querySelector('.date').textContent).toBe('2023-07-15 SAT');
    });

    test('zeroPadding should pad numbers with zeros', () => {
        expect(clock.zeroPadding(5, 2)).toBe('05');
        expect(clock.zeroPadding(123, 5)).toBe('00123');
        expect(clock.zeroPadding(0, 3)).toBe('000');
    });

    test('should handle invalid dates gracefully', () => {
        expect(() => clock.update(new Date('invalid date'))).toThrow('Invalid date');
    });

    test('should handle boundary values for dates', () => {
        const minDate = new Date(0); // 1 January 1970
        const maxDate = new Date(8640000000000000); // 13 September 275760

        expect(() => clock.update(minDate)).not.toThrow();
        expect(() => clock.update(maxDate)).not.toThrow();
    });

    test('should throw error if timeElement or dateElement is missing', () => {
        document.body.innerHTML = `<div id="clock"></div>`;
        expect(() => new Clock()).toThrow('Clock elements are not found');
    });

    test('update method should be performant', () => {
        const start = performance.now();
        clock.update(new Date());
        const end = performance.now();
        expect(end - start).toBeLessThan(50); // Update should take less than 50ms
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clean up the DOM
    });
});
