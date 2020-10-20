import type { APIGatewayProxyEvent, Context } from 'aws-lambda';

const getId = (event: APIGatewayProxyEvent, context: Context): string => {
  const lambdaRequestId: string = context.awsRequestId;
  const correlationId: string = event?.headers?.['X-Correlation-Id'] || lambdaRequestId;

  return correlationId;
};

export const correlation = {
  getId,
};
