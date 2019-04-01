import * as pretty from 'pretty-time';

export class Stopwatch {
    constructor() {
        this.start = process.hrtime();
    }

    Stop():string {
        return pretty(process.hrtime(this.start));
    }

    private start:[number, number];
}