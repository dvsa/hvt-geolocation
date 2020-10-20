import { v4 } from 'uuid';
import { logger, Logger } from '../../src/util/logger';

describe('Test logger', () => {
  test('logger.create() returns Logger instance with correct logFormat', () => {
    const apiRequestId: string = v4();
    const correlationId: string = v4();

    const log: Logger = logger.create(apiRequestId, correlationId);

    expect(log.logFormat).toBe(
      `{ "apiRequestId": "${apiRequestId}", "correlationId": "${correlationId}", "message": "%s" }`,
    );
  });

  test('Logger.debug() calls console.debug() with expected parameters', () => {
    const log: Logger = new Logger('', '');
    console.debug = jest.fn();

    log.debug('hello');

    expect(console.debug).toHaveBeenCalledWith(log.logFormat, 'hello');
  });

  test('Logger.info() calls console.info() with expected parameters', () => {
    const log: Logger = new Logger('', '');
    console.info = jest.fn();

    log.info('hello');

    expect(console.info).toHaveBeenCalledWith(log.logFormat, 'hello');
  });

  test('Logger.warn() calls console.warn() with expected parameters', () => {
    const log: Logger = new Logger('', '');
    console.warn = jest.fn();

    log.warn('hello');

    expect(console.warn).toHaveBeenCalledWith(log.logFormat, 'hello');
  });

  test('Logger.error() calls console.error() with expected parameters', () => {
    const log: Logger = new Logger('', '');
    console.error = jest.fn();

    log.error('hello');

    expect(console.error).toHaveBeenCalledWith(log.logFormat, 'hello');
  });
});
