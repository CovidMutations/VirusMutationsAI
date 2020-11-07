import { ModuleRef } from '@nestjs/core';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import * as fs from 'fs';
import * as path from 'path';
import * as jsonfile from 'jsonfile';
import {promisify} from 'util';
const stat = promisify(fs.stat);
import { DBUpdatingCronEnum, AdminSettingsModel  } from '../model/admin.model';
import { AdminService  } from '../admin/admin.service';


@Injectable()
export class TasksService {
  private logger = new Logger('TasksService ');
  private adminFilePath = path.join(__dirname, '..', '..', 'admin', 'admin.json');

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly adminService: AdminService
 //   private readonly moduleRef: ModuleRef
  ) {
    this.createUpdateDBCron();
  //  this.adminService = this.moduleRef.get(AdminService);
  }


  private async createUpdateDBCron() {
    this.logger.verbose(`getDefaultCronValue`);
    let cronTime = DBUpdatingCronEnum.monthly;
    let cronName = 'updateDBCron';

    const result = await stat(this.adminFilePath);

    if (result) {
      const res: AdminSettingsModel = await jsonfile.readFile(this.adminFilePath);
      cronTime = DBUpdatingCronEnum[res.frequency]
    }

    const job = new CronJob(cronTime, () => {
      this.logger.warn(`job ${cronName} & time (${job.cronTime.source}) running!`);
      // =================== jobs ======================
      this.adminService.updateDB();
      // =================== / jobs ======================

    });
  
    this.schedulerRegistry.addCronJob(cronName, job);
    job.start();
    this.logger.warn(`job ${cronName} & time (${cronTime}) started!`);
  }


}
