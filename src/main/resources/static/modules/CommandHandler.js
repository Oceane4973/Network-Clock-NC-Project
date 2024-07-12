import { initializeClock } from './clock.js';

export class CommandHandler {
    constructor() {
        this.currentDateFormat = "yyyy-MM-dd HH:mm:ss";
        this.currentDate = new Date();
        this.clock = initializeClock();
        this.commands = {
            '--help': this.showHelp.bind(this),
            '--set-time': this.setTime.bind(this),  // Changed from --set-date to --set-time
            '--set-format': this.setFormat.bind(this),
            '--get-format': this.getFormat.bind(this),
            '--get-time': this.getTime.bind(this)
        };
    }

    handleCommand(command) {
        const [cmd, ...args] = this.splitArgs(command);
        if (cmd === 'nc') {
            return this.handleNC(args);
        } else {
            return `Command not found: ${cmd}`;
        }
    }

    handleNC(args) {
        const [subCmd, ...subArgs] = args;
        if (this.commands[subCmd]) {
            return this.commands[subCmd](subArgs);
        } else {
            return `Unknown command: ${subCmd}`;
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
        try {
            const [format, dateStr] = args;
            const parsedDate = this.parseDate(dateStr, format);
            if (!parsedDate) {
                throw new Error("Invalid date");
            }
            this.currentDate = parsedDate;
            this.clock.update(this.currentDate); // Update clock display
            return `Date set to: ${this.formatDate(this.currentDate, this.currentDateFormat)}`;
        } catch (e) {
            return "Error: Invalid date format or date value";
        }
    }

    setFormat(args) {
        if (args.length !== 1) {
            return "Usage: nc --set-format [format]";
        }
        try {
            const format = args[0];
            this.currentDateFormat = format;
            return `Date format set to: ${this.currentDateFormat}`;
        } catch (e) {
            return "Error: Invalid date format";
        }
    }

    getFormat() {
        return `Current date format: ${this.currentDateFormat}`;
    }

    getTime() {
        return `Current date: ${this.formatDate(this.currentDate, this.currentDateFormat)}`;
    }

    parseDate(dateStr, format) {
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
            parts[fmt['HH']],
            parts[fmt['mm']],
            parts[fmt['ss']]
        );

        return date;
    }

    formatDate(date, format) {
        const map = {
            yyyy: date.getFullYear(),
            MM: ('0' + (date.getMonth() + 1)).slice(-2),
            dd: ('0' + date.getDate()).slice(-2),
            HH: ('0' + date.getHours()).slice(-2),
            mm: ('0' + date.getMinutes()).slice(-2),
            ss: ('0' + date.getSeconds()).slice(-2)
        };

        return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, match => map[match]);
    }
}
