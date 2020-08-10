import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as csvdata from 'csvdata';
import {SchedulerRegistry} from '@nestjs/schedule';
import { CronTime } from 'cron';

import {SetFrequencyDTO, DBUpdatingFrequencyEnum, AdminSettingsModel, DBUpdatingCronEnum} from '../model/admin.model';


@Injectable()
export class AdminService {
  private logger = new Logger('AdminService');
  private adminFilePath = path.join(__dirname, '..', '..', 'assets', 'admin.csv');
  private csvHeader = {header: 'frequency,lastUpdateDB'};
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    this.createDefaultAdminCSV();
  }

  async getFrequency(): Promise<string> {
    this.logger.verbose('getFrequency');
    const res: AdminSettingsModel[] = await csvdata.load(this.adminFilePath);
    return res[0].frequency;
  }

  async setFrequency(res: SetFrequencyDTO): Promise<string> {
    this.logger.verbose('setFrequency');
    const csv: AdminSettingsModel[] = await csvdata.load(this.adminFilePath);
    await csvdata.write(this.adminFilePath, [{...csv[0], ...res}], this.csvHeader);

    const job = this.schedulerRegistry.getCronJob('updateDBCron');
    job.setTime(new CronTime(DBUpdatingCronEnum[res.frequency]));
    job.start();

    return res.frequency
  }

  async getUpdateDBDate(): Promise<number> {
    this.logger.verbose('getUpdateDBDate');
    const res: AdminSettingsModel[] = await csvdata.load(this.adminFilePath);
    return res[0].lastUpdateDB;
  }


  async setUpdateDBDate(): Promise<number> {
    this.logger.verbose('setUpdateDBDate');
    const csv: AdminSettingsModel[] = await csvdata.load(this.adminFilePath);
    await csvdata.write(this.adminFilePath, [{...csv[0], lastUpdateDB: Date.now()}], this.csvHeader);
    return Date.now();
  }


  private createDefaultAdminCSV(){
    fs.stat(this.adminFilePath, (err, stats)=>{
      if(err) {
        this.logger.verbose(`createDefaultAdminCSV`);
        csvdata.write(this.adminFilePath, [{
          frequency: DBUpdatingFrequencyEnum.monthly,
          lastUpdateDB: Date.now()
        }], this.csvHeader)
      }
    })
  }

}
