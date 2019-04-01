import * as winston from 'winston';
import * as Transport from 'winston-transport';
import * as DailyRotateFile from 'winston-daily-rotate-file';


export function Setup():void {
    const { LOG_LEVEL, LOG_DIR, LOG_FILE } = process.env;

    let transports:Transport[] = [
        new winston.transports.Console({
            format: GetConsoleTransportFormat()
        })
    ];

    if(!!LOG_FILE && LOG_FILE.length > 0) {
        transports.push(new DailyRotateFile({
            datePattern:'YYYY-MM-DD-HH',
            dirname:LOG_DIR,
            filename:LOG_FILE,
            maxFiles:'1y'
        }));
    }

    winston.configure({
        level: LOG_LEVEL,
        transports
    });

    winston.info('Application log starting.');
}

function GetConsoleTransportFormat() {
    return winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.align(),
        winston.format.printf((info) => {
            const {
            timestamp, level, message, ...args
            } = info;
    
            const ts = timestamp.slice(0, 19).replace('T', ' ');
            return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
    );
}