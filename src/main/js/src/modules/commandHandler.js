import { Clock } from './clock.js';

export class CommandHandler {
    constructor(clock) {
        this.currentDateFormat = "yyyy-MM-dd HH:mm:ss";
        this.currentDate = new Date();
        this.clock = clock;
        this.commands = {
            '--help': this.showHelp.bind(this),
            '--set-time': this.setTime.bind(this),
            '--set-format': this.setFormat.bind(this),
            '--get-format': this.getFormat.bind(this),
            '--get-time': this.getTime.bind(this)
        };
    }

    handleCommand(command) {
        try {
            const [cmd, ...args] = this.splitArgs(command);
            if (cmd === 'nc') {
                return this.handleNC(args);
            } else {
                return `Command not found: ${cmd}`;
            }
        } catch (error) {
            console.error('Error handling command:', error);
            return 'An error occurred while handling the command.';
        }
    }

    handleNC(args) {
        try {
            const [subCmd, ...subArgs] = args;
            if (this.commands[subCmd]) {
                return this.commands[subCmd](subArgs);
            } else {
                return `Unknown command: ${subCmd}`;
            }
        } catch (error) {
            console.error('Error handling sub-command:', error);
            return 'An error occurred while handling the sub-command.';
        }
    }

    splitArgs(command) {
        const regex = /"([^"]+)"|(\S+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(command)) !== null) {
            matches.push(match[1] || match[2]);
        }
        return matches;
    }

    showHelp() {
        return `
Usage:\n
nc --help                   : Show this help message
nc --set-time [format] [date] : Set the date and time
nc --set-format [format]    : Set the date format
nc --get-format             : Get the current date format
nc --get-time               : Get the current date
        `;
    }

    setTime(args) {
        if (args.length !== 2) {
            return "Usage: nc --set-time [format] [date]";
        }

        const [format, dateStr] = args;
        if (!this.isValidDateFormat(format)) {
            return "Error: Invalid date format";
        }

        const parsedDate = this.parseDate(dateStr, format);
        if (!parsedDate || isNaN(parsedDate.getTime())) {
            return "Error: Invalid date format or date value";
        }

        this.currentDate = parsedDate;
        this.clock.update(this.currentDate); // Update clock display
        return `Date set to: ${this.formatDate(this.currentDate, this.currentDateFormat)}`;
    }

    setFormat(args) {
        if (args.length !== 1) {
            return "Usage: nc --set-format [format]";
        }
        try {
            const format = args[0];
            this.validateDateFormat(format);
            this.currentDateFormat = format;
            // this.clock.update(this.currentDate); // Update clock display with new format
            return `Date format set to: ${this.currentDateFormat}`;
        } catch (e) {
            return "Error: Invalid date format";
        }
    }

    validateDateFormat(format) {
        if (!this.isValidDateFormat(format)) {
            throw new Error("Invalid date format");
        }
    }

    isValidDateFormat(format) {
        const formatRegex = /^(yyyy|MM|dd|HH|mm|ss)([-\/:. ]?(yyyy|MM|dd|HH|mm|ss))*$/;
        return formatRegex.test(format);
    }

    getFormat() {
        return `Current date format: ${this.currentDateFormat}`;
    }

    getTime() {
        return `Current date: ${this.formatDate(this.currentDate, this.currentDateFormat)}`;
    }

    parseDate(dateStr, format) {
        try {
            const parts = dateStr.match(/(\d+)/g);
            if (!parts) return null;

            let i = 0;
            const fmt = {};
            format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, part => {
                fmt[part] = i++;
            });

            const date = new Date(
                parts[fmt['yyyy']],
                parts[fmt['MM']] - 1,
                parts[fmt['dd']],
                parts[fmt['HH']] || 0,
                parts[fmt['mm']] || 0,
                parts[fmt['ss']] || 0
            );

            return date;
        } catch (error) {
            console.error('Error parsing date:', error);
            return null;
        }
    }

    formatDate(date, format) {
        try {
            const map = {
                yyyy: date.getFullYear(),
                MM: ('0' + (date.getMonth() + 1)).slice(-2),
                dd: ('0' + date.getDate()).slice(-2),
                HH: ('0' + date.getHours()).slice(-2),
                mm: ('0' + date.getMinutes()).slice(-2),
                ss: ('0' + date.getSeconds()).slice(-2)
            };

            return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, match => map[match]);
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    }
}