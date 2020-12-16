import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

export interface IAppConfig {
  apiEndpoint2: string;
}

export const APP_CONFIG = new InjectionToken<IAppConfig>('app.config');

export const VMAI_CONFIG = {
  apiEndpoint2: environment.api2,
};

