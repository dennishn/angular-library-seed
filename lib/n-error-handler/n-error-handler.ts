import {ErrorHandler} from "@angular/core";
export class NErrorHandler extends ErrorHandler {
    private env: string;

    constructor() {
        super(true);
        this.env = process.env.ENV || 'undefined';
        if('Bugsnag' in window) {
            Bugsnag.releaseStage = this.env;
        }
    }

    handleError(error: any): void {
        if('Bugsnag' in window) {
            Bugsnag.notifyException(error);
        }

        super.handleError(error);
    }
}