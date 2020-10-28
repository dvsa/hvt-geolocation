import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context,
} from 'aws-lambda';
import { AxiosResponse } from 'axios';
import { correlation } from '../../src/lib/correlation';
import { config, Config } from '../../src/lib/config';
import { Logger, logger } from '../../src/util/logger';
import { request } from '../../src/util/request';
import { sortAtfs } from '../../src/lib/sortAtfs';
import { pagination } from '../../src/lib/pagination';
import { handler } from '../../src/handler';
import { AuthorisedTestingFacility } from '../../src/models/authorisedTestingFacility';
import { createAtfsSortedDescByLatLong } from '../data-providers/atf.dataProvider';

const paginationPage = 1;
const paginationLimit = 10;

let eventMock: APIGatewayProxyEvent;
let contextMock: Context;

describe('Test lambda handler', () => {
  beforeAll(() => {
    eventMock = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: paginationPage, limit: paginationLimit },
      requestContext: { },
    };
    contextMock = <Context> {};

    jest.spyOn(config, 'load').mockReturnValue(<Config> { });
    jest.spyOn(correlation, 'getId').mockReturnValue('123-456-789');
    jest.spyOn(logger, 'create').mockReturnValue(<Logger> <unknown> {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    });
  });

  test('should return 200 with paginated ATFs in order (nearest first)', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length, ScannedCount: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.slice().reverse();
    const paginatedAtfsMock: AuthorisedTestingFacility[] = sortedAtfsMock.slice(0, paginationLimit);
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({
      Items: paginatedAtfsMock,
      Count: paginatedAtfsMock.length,
      ScannedCount: unsortedAtfs.length,
    }));
  });

  test('should return 200 with all ATFs in order (nearest first) when no pagination params provided', async () => {
    const eventWithMissingQueryParams: APIGatewayProxyEvent = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: undefined, limit: undefined },
      requestContext: { },
    };
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventWithMissingQueryParams.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.slice().reverse();
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);
    const paginationSpy = jest.spyOn(pagination, 'paginate');

    const res: APIGatewayProxyResult = await handler(eventWithMissingQueryParams, contextMock);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({
      Items: sortedAtfsMock,
      Count: sortedAtfsMock.length,
      ScannedCount: unsortedAtfs.length,
    }));
    expect(paginationSpy).toHaveBeenLastCalledWith(sortedAtfsMock, undefined, undefined);
  });

  test('should return 200 with all ATFs in order (nearest first) when pagination fails', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.slice().reverse();
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);
    jest.spyOn(pagination, 'paginate').mockImplementation(() => { throw new Error('oops!'); });

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({
      Items: sortedAtfsMock,
      Count: sortedAtfsMock.length,
      ScannedCount: unsortedAtfs.length,
    }));
  });

  test('should throw error when failed to fetch postcode lat/long values', async () => {
    jest.spyOn(request, 'get').mockImplementation(async () => Promise.reject(new Error('oops!')));

    await expect(handler(eventMock, contextMock)).rejects.toThrow('oops!');
  });

  test('should throw error when failed to fetch ATFs', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockImplementationOnce(async () => Promise.reject(new Error('oops!')));

    await expect(handler(eventMock, contextMock)).rejects.toThrow('oops!');
  });

  test('should throw error when failed to sort ATFs', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    jest.spyOn(sortAtfs, 'nearestFirst').mockImplementation(() => { throw new Error('oops!'); });

    await expect(handler(eventMock, contextMock)).rejects.toThrow('oops!');
  });
});
