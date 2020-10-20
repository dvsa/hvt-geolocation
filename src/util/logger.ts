export class Logger {
  logFormat: string;

  constructor(apiRequestId: string, correlationId: string) {
    this.logFormat = `{ "apiRequestId": "${apiRequestId}", "correlationId": "${correlationId}", "message": "%s" }`;
  }

  public debug(msg: string): void {
    console.debug(this.logFormat, msg);
  }

  public info(msg: string): void {
    console.info(this.logFormat, msg);
  }

  public warn(msg: string): void {
    console.warn(this.logFormat, msg);
  }

  public error(msg: string): void {
    console.error(this.logFormat, msg);
  }
}

const create = (apiRequestId: string, correlationId: string): Logger => new Logger(apiRequestId, correlationId);

export const logger = {
  create,
};
