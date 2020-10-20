import axios, { AxiosResponse } from 'axios';

const get = async (url: string, correlationId: string): Promise<AxiosResponse> => {
  const headers: Record<string, string> = { 'X-Correlation-Id': correlationId };
  return axios.get(url, { headers });
};

export const request = {
  get,
};
