import type {
  APIGatewayProxyEvent, APIGatewayProxyResult, Context,
} from 'aws-lambda';
import { AxiosResponse } from 'axios';
import { correlation } from '../../src/lib/correlation';
import { config, Config } from '../../src/lib/config';
import { Logger, logger } from '../../src/util/logger';
import { request } from '../../src/util/request';
import { sortAtfs } from '../../src/lib/sortAtfs';
import { filterAtfs } from '../../src/lib/filterAtfs';
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

    jest.spyOn(config, 'load').mockReturnValue(<Config> { readApiUrl: 'mock' });
    jest.spyOn(correlation, 'getId').mockReturnValue('123-456-789');
    jest.spyOn(logger, 'create').mockReturnValue(<Logger> <unknown> {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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
    jest.spyOn(pagination, 'paginate').mockReturnValueOnce(paginatedAtfsMock);

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

  test('should call the removeAtfsWithNoAvailability filter function if query param is true', async () => {
    const eventWithMissingQueryParams: APIGatewayProxyEvent = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: undefined, limit: undefined, removeAtfsWithNoAvailability: 'true' },
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
    const filterSpy = jest.spyOn(filterAtfs, 'removeAtfsWithNoAvailability');
    filterSpy.mockReturnValue(unsortedAtfs);
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventWithMissingQueryParams, contextMock);

    expect(res.statusCode).toBe(200);
    expect(filterSpy).toHaveBeenCalledTimes(1);
  });

  test('should not call the removeAtfsWithNoAvailability filter function if query param is false', async () => {
    const eventWithMissingQueryParams: APIGatewayProxyEvent = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: undefined, limit: undefined, removeAtfsWithNoAvailability: 'false' },
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
    const filterSpy = jest.spyOn(filterAtfs, 'removeAtfsWithNoAvailability');
    filterSpy.mockReturnValue(unsortedAtfs);
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventWithMissingQueryParams, contextMock);

    expect(res.statusCode).toBe(200);
    expect(filterSpy).not.toHaveBeenCalled();
  });

  test('should not call the removeAtfsWithNoAvailability filter function if query param is undefined', async () => {
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
    const filterSpy = jest.spyOn(filterAtfs, 'removeAtfsWithNoAvailability');
    filterSpy.mockReturnValue(unsortedAtfs);
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventWithMissingQueryParams, contextMock);

    expect(res.statusCode).toBe(200);
    expect(filterSpy).not.toHaveBeenCalled();
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

  test('should still return the ATFs unsorted if an error is thrown during sorting', async () => {
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
    const expectedAtfs = unsortedAtfs.slice(0, 10);
    jest.spyOn(pagination, 'paginate').mockReturnValueOnce(expectedAtfs);

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(JSON.stringify({
      Items: expectedAtfs,
      Count: expectedAtfs.length,
      ScannedCount: unsortedAtfs.length,
    }));
  });

  test('should remove any ATFs that do not have geolocation data', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    unsortedAtfs[0].geoLocation = { lat: null, long: undefined };
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.slice().reverse();
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    const sortAtfsSpy = jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);
    expect(res.statusCode).toEqual(200);
    expect(sortAtfsSpy).toHaveBeenLastCalledWith(expect.anything(), unsortedAtfs.slice(1));
  });

  test('should log any errors occurred during filtering but continue with the response', async () => {
    const eventWithFilterNoAvailability: APIGatewayProxyEvent = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: paginationPage, limit: paginationLimit, removeAtfsWithNoAvailability: 'true' },
      requestContext: { },
    };
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventWithFilterNoAvailability.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = createAtfsSortedDescByLatLong(50);
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    const sortedAtfsMock = unsortedAtfs.slice().reverse();
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);
    jest.spyOn(filterAtfs, 'removeAtfsWithNoAvailability')
      .mockImplementation(() => { throw new Error('filter failed'); });

    const res: APIGatewayProxyResult = await handler(eventWithFilterNoAvailability, contextMock);
    expect(res.statusCode).toEqual(200);
  });
});
