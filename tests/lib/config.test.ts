import dotenv, { DotenvConfigOutput } from 'dotenv';
import { Config, config } from '../../src/lib/config';

const readApiUrl = 'API_BASE_URL_READ';
const dynamoDbAtfTable = 'DYNAMODB_ATF_TABLE_NAME';
const dynamoDbLocationTable = 'DYNAMODB_LOCATION_TABLE_NAME';

describe('Test config', () => {
  beforeEach(() => {
    process.env = {};
  });

  test('config.load() returns expected Config', () => {
    jest.spyOn(dotenv, 'config').mockImplementation(() => {
      process.env.API_BASE_URL_READ = readApiUrl;
      process.env.DYNAMODB_ATF_TABLE_NAME = dynamoDbAtfTable;
      process.env.DYNAMODB_LOCATION_TABLE_NAME = dynamoDbLocationTable;
      return <DotenvConfigOutput> {};
    });

    const cfg: Config = config.load();

    expect(cfg).toEqual({ readApiUrl, dynamoDbAtfTable, dynamoDbLocationTable });
  });

  test('config.load() throws error when environment variable is missing', () => {
    jest.spyOn(dotenv, 'config').mockImplementation(() => {
      process.env.API_BASE_URL_READ = readApiUrl;
      process.env.DYNAMODB_ATF_TABLE_NAME = dynamoDbAtfTable;
      return <DotenvConfigOutput> {};
    });

    expect(() => { config.load(); }).toThrow(
      'Environment variable DYNAMODB_LOCATION_TABLE_NAME seems to be missing.',
    );
  });
});
