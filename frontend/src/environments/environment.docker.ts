import { Environment } from './environment.interface';

export const environment: Environment = {
  production: true,
  api: '${API_URL}',
  api2: '${API2_URL}',
};
