import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as fs from 'fs';
import * as path from 'path';
import * as csvdata from 'csvdata';
import {promisify} from 'util';
const stat = promisify(fs.stat);
import { DBUpdatingCronEnum, AdminSettingsModel  } from '../model/admin.model';


@Injectable()
export class TasksService {
  private logger = new Logger('TasksService ');
  private adminFilePath = path.join(__dirname, '..', '..', 'assets', 'admin.csv');

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    this.createUpdateDBCron();
  }


  private async createUpdateDBCron() {
    this.logger.verbose(`getDefaultCronValue`);
    let cronTime = DBUpdatingCronEnum.monthly;
    let cronName = 'updateDBCron';

    const result = await stat(this.adminFilePath);

    if (result) {
      const res: AdminSettingsModel[] = await csvdata.load(this.adminFilePath);
      cronTime = DBUpdatingCronEnum[res[0].frequency]
    }

    const job = new CronJob(cronTime, () => {
      this.logger.warn(`job ${cronName} & time (${job.cronTime.source}) running!`);
      this.updateDBJob();
    });
  
    this.schedulerRegistry.addCronJob(cronName, job);
    job.start();
    this.logger.warn(`job ${cronName} & time (${cronTime}) started!`);
  }

  private updateDBJob() {

  }

}
