import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

export interface IAppConfig {
  apiEndpoint: string;

}

export const APP_CONFIG = new InjectionToken<IAppConfig>('app.config');

export const VMAI_CONFIG = {
  apiEndpoint: environment.api,

};

