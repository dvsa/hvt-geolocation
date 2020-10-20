import axios from 'axios';
import { v4 } from 'uuid';
import { request } from '../../src/util/request';

describe('Test request.util', () => {
  test('get() sends http request to correct url with expected headers', async () => {
    const url = 'http://test-url.com';
    const correlationId = v4();
    const axiosMock = jest.spyOn(axios, 'get').mockReturnValue(Promise.resolve({}));
    const headers = { 'X-Correlation-Id': correlationId };

    await request.get(url, correlationId);

    expect(axiosMock).toHaveBeenCalledWith(url, { headers });
  });
});
