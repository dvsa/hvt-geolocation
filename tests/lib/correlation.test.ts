import type { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { v4 } from 'uuid';
import { correlation } from '../../src/lib/correlation';

describe('Test correlation', () => {
  test('getId() returns expected Correlation ID from headers', () => {
    const correlationId: string = v4();
    const headers: Record<string, string> = { 'X-Correlation-Id': correlationId };
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> { headers };
    const awsRequestId: string = v4();
    const contextMock: Context = <Context> { awsRequestId };

    const corId: string = correlation.getId(eventMock, contextMock);

    expect(corId).toEqual(correlationId);
  });

  test('getId() returns expected Correlation ID when no header supplied', () => {
    const headers: Record<string, string> = { };
    const eventMock: APIGatewayProxyEvent = <APIGatewayProxyEvent> { headers };
    const awsRequestId: string = v4();
    const contextMock: Context = <Context> { awsRequestId };

    const corId: string = correlation.getId(eventMock, contextMock);

    expect(corId).toEqual(awsRequestId);
  });
});
