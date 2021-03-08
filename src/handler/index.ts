import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { AxiosResponse } from 'axios';
import { config, Config } from '../lib/config';
import { AuthorisedTestingFacility } from '../models/authorisedTestingFacility';
import { GeoLocation } from '../models/geoLocation';
import { correlation } from '../lib/correlation';
import { logger, Logger } from '../util/logger';
import { request } from '../util/request';
import { PagedResponse } from '../models/pagedResponse';
import { pagination } from '../lib/pagination';
import { sortAtfs } from '../lib/sortAtfs';
import { filterAtfs } from '../lib/filterAtfs';

/**
 * Lambda Handler
 *
 * @param {APIGatewayProxyEvent} event
 * @param {Context} context
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  const cfg: Config = config.load();
  const corrId: string = correlation.getId(event, context);
  const log: Logger = logger.create(event?.requestContext.requestId, corrId);
  const { postcode } = event.pathParameters;
  const page: string = event.queryStringParameters?.page;
  const limit: string = event.queryStringParameters?.limit;
  const removeNoAvailabilityFlag: boolean = event.queryStringParameters?.removeAtfsWithNoAvailability === 'true';
  log.info(`Fetching nearest ATFs; postcode [${postcode}], page [${page}], limit [${limit}], 
    removeAtfsWithNoAvailability [${removeNoAvailabilityFlag.toString()}]`);

  // Get Latitude & Longitude for postcode
  // use read not read-all fix for prod so not affect local
  const url = cfg.readApiUrl.replace('-all', '');
  const geoLocation: GeoLocation = await request.get(
    // use read not read-all fix for prod so not affect local
    `${url}/${cfg.dynamoDbLocationTable}/${postcode}?keyName=postcode`, corrId,
  )
    .then((response: AxiosResponse<GeoLocation>) => {
      log.info(`Fetched postcode [${postcode}] geo-location: [${JSON.stringify(response.data)}]`);
      return response.data;
    })
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      log.error(`An unexpected error occurred when fetching postcode [${postcode}] geo-location: ${errorString}`);
      throw error;
    });

  // Get ATFs
  const atfs: PagedResponse<AuthorisedTestingFacility> = await request.get(
    `${cfg.readApiUrl}/${cfg.dynamoDbAtfTable}`, corrId,
  )
    .then((response: AxiosResponse<PagedResponse<AuthorisedTestingFacility>>) => {
      log.info(`Fetched ATFs [${response.data.Count}]`);
      return response.data;
    })
    .catch((error) => {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      log.error(`An unexpected error occurred when fetching ATFs: ${errorString}`);
      throw error;
    });
  // Filtering
  atfs.Items = filterAtfs.removeAtfsWithNoGeolocationData(atfs.Items, log);
  log.info(`ATFs after filtering out those with no geolocation data [${atfs.Items.length}]`);
  if (removeNoAvailabilityFlag) {
    try {
      atfs.Items = filterAtfs.removeAtfsWithNoAvailability(atfs.Items);
      log.info(`ATFs after filtering out those with no availability [${atfs.Items.length}]`);
    } catch (error) {
      const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
      log.error(`An unexpected error occurred when filtering ATFs: ${errorString}`);
    }
  }

  // Sort ATFs
  try {
    atfs.Items = sortAtfs.nearestFirst(geoLocation, atfs.Items);
    log.info(`Sorted ATFs [${atfs.Items.length}]`);
  } catch (error) {
    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
    log.error(`An unexpected error occurred when sorting ATFs: ${errorString}`);
  }

  // Paginate ATFs
  try {
    atfs.Items = pagination.paginate(atfs.Items, page, limit);
    log.info(`Paginated ATFs [${atfs.Items.length}]; page [${page}], limit [${limit}]`);
  } catch (error) {
    const errorString: string = JSON.stringify(error, Object.getOwnPropertyNames(error));
    log.warn(`An unexpected error occurred when paginating ATFs: ${errorString}`);
  }
  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ Items: atfs.Items, Count: atfs.Items.length, ScannedCount: atfs.Items.length }),
  });
};
