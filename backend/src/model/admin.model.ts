import {IsString, IsEnum, IsArray, IsBoolean, IsNotEmpty, IsEmpty, IsBooleanString} from 'class-validator';

export enum DBUpdatingFrequencyEnum {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly'
}



export class SetFrequencyDTO {
  @IsEnum(DBUpdatingFrequencyEnum)
  frequency: string;
}



export class AdminSettingsModel {
  lastUpdateDB: number;
  frequency: string;
}


