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

let eventMock: APIGatewayProxyEvent;
let contextMock: Context;

// eslint-disable-next-line max-len
const createAtf = (lat: number, long: number): AuthorisedTestingFacility => <AuthorisedTestingFacility> { geoLocation: { lat, long } };

describe('Test lambda handler', () => {
  beforeAll(() => {
    eventMock = <APIGatewayProxyEvent> <unknown> {
      pathParameters: { postcode: 'AB123CD' },
      queryStringParameters: { page: '1', limit: '10' },
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
    const unsortedAtfs: AuthorisedTestingFacility[] = [];
    for (let i = 50; i > 0; i--) {
      unsortedAtfs.push(createAtf(i, i));
    }
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length, ScannedCount: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.reverse();
    const paginatedAtfsMock: AuthorisedTestingFacility[] = sortedAtfsMock.slice(0, 11);
    jest.spyOn(request, 'get')
      .mockReturnValueOnce(Promise.resolve(postcodeResponseMock))
      .mockReturnValueOnce(Promise.resolve(atfsResponseMock));
    jest.spyOn(sortAtfs, 'nearestFirst').mockReturnValue(sortedAtfsMock);
    jest.spyOn(pagination, 'paginate').mockReturnValue(paginatedAtfsMock);

    const res: APIGatewayProxyResult = await handler(eventMock, contextMock);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(JSON.stringify({
      Items: paginatedAtfsMock,
      Count: paginatedAtfsMock.length,
      ScannedCount: unsortedAtfs.length,
    }));
  });

  test('should return 200 with all ATFs in order (nearest first) when pagination fails', async () => {
    const postcodeResponseMock: AxiosResponse = <AxiosResponse> {
      data: { postcode: eventMock.pathParameters.postcode, lat: 0, long: 0 },
    };
    const unsortedAtfs: AuthorisedTestingFacility[] = [];
    for (let i = 50; i > 0; i--) {
      unsortedAtfs.push(createAtf(i, i));
    }
    const atfsResponseMock: AxiosResponse = <AxiosResponse> {
      data: { Items: unsortedAtfs, Count: unsortedAtfs.length },
    };
    const sortedAtfsMock: AuthorisedTestingFacility[] = unsortedAtfs.reverse();
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
    const unsortedAtfs: AuthorisedTestingFacility[] = [];
    for (let i = 50; i > 0; i--) {
      unsortedAtfs.push(createAtf(i, i));
    }
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
