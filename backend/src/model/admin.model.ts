import {IsString, IsEnum, IsArray, IsBoolean, IsNotEmpty, IsEmpty, IsBooleanString} from 'class-validator';

export enum DBUpdatingFrequencyEnum {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly'
}

export enum DBUpdatingCronEnum {
  // daily = '5 * * * * *',
  // weekly = '15 * * * * *',
  // monthly = '25 * * * * *'

  daily = '0 0 23 * * *',
  weekly = '0 0 23 * * 6',
  monthly = '0 0 23 1 * *'
}

export class SetFrequencyDTO {
  @IsEnum(DBUpdatingFrequencyEnum)
  frequency: string;
}



export class AdminSettingsModel {
  lastUpdateDB: number;
  frequency: string;
}


export class ResUpdateDBModel {
  lastUpdateDB: number;
  status: string;
  status_text: string;
}

