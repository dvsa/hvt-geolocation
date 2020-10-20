import dotenv from 'dotenv';

export interface Config {
  readApiUrl: string
  dynamoDbAtfTable: string,
  dynamoDbLocationTable: string,
}

const load = (): Config => {
  const envVars: string[] = [
    'API_BASE_URL_READ',
    'DYNAMODB_ATF_TABLE_NAME',
    'DYNAMODB_LOCATION_TABLE_NAME',
  ];

  dotenv.config(); // Load Environment variables from '.env' file

  envVars.forEach((envVar) => {
    if (!process.env[`${envVar}`]) {
      throw new Error(`Environment variable ${envVar} seems to be missing.`);
    }
  });

  return {
    readApiUrl: process.env.API_BASE_URL_READ,
    dynamoDbAtfTable: process.env.DYNAMODB_ATF_TABLE_NAME,
    dynamoDbLocationTable: process.env.DYNAMODB_LOCATION_TABLE_NAME,
  };
};

export const config = {
  load,
};
