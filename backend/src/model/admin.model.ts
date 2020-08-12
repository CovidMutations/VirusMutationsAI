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
  status: string;
  status_text: string;

  constructor(row?) {
    if(row) {
      Object.keys(row).forEach(innerProp =>{
        if(this.hasOwnProperty(innerProp)) {
          this[innerProp] = row[innerProp];
        }
      })
    } else {
      this.frequency = DBUpdatingFrequencyEnum.monthly;
      this.lastUpdateDB = Date.now();
      this.status = 'none';
      this.status_text = 'none';
    }
  }
}


export class ResUpdateDBModel {
  lastUpdateDB: number = undefined;
  status: string = undefined;
  status_text: string = undefined;

  constructor(row) {
    Object.keys(row).forEach(innerProp =>{
      if(this.hasOwnProperty(innerProp)) {
        this[innerProp] = row[innerProp];
      }
    })
  }
}

