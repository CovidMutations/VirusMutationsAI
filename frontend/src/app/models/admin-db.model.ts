export enum DBUpdatingFrequencyEnum {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly'
}



export class AdminUpdateDBModel {
  lastUpdate: string;
  updatingFrequency: string;
}

export class UpdateDBStatusModel {
  lastUpdateDB: number;
  status: string;
  status_text: string;
}

