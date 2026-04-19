import axios, { AxiosInstance } from 'axios';

interface HttpClientConfig {
  connectTimeout?: number;
  responseTimeout?: number;
}

export function createHttpClient(config?: HttpClientConfig): AxiosInstance {
  const connectTimeout = config?.connectTimeout ?? 8000;
  const responseTimeout = config?.responseTimeout ?? 15000;
  return axios.create({ timeout: connectTimeout + responseTimeout });
}

export const httpClient = createHttpClient();
