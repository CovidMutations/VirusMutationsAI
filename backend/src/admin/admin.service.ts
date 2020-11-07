import { Injectable, Logger} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as jsonfile from 'jsonfile';
import {SchedulerRegistry} from '@nestjs/schedule';
import { CronTime } from 'cron';
import {PythonShell} from 'python-shell';
import {promisify} from 'util';
import {SetFrequencyDTO, AdminSettingsModel, DBUpdatingCronEnum, ResUpdateDBModel} from '../model/admin.model';


@Injectable()
export class AdminService {
  private logger = new Logger('AdminService');

  private adminFilePath = path.join(__dirname, '..', '..', 'admin', 'admin.json');
  constructor(
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    this.createDefaultAdminJSON();
  }

  async getFrequency(): Promise<string> {
    this.logger.verbose('getFrequency');
    const res: AdminSettingsModel = await jsonfile.readFile(this.adminFilePath);
    return res.frequency;
  }

  async setFrequency(res: SetFrequencyDTO): Promise<string> {
    this.logger.verbose('setFrequency');
    const adminFileJson: AdminSettingsModel = await jsonfile.readFile(this.adminFilePath);
    jsonfile.writeFile(this.adminFilePath, {...adminFileJson, ...res});

    const job = this.schedulerRegistry.getCronJob('updateDBCron');
    job.setTime(new CronTime(DBUpdatingCronEnum[res.frequency]));
    job.start();

    return res.frequency
  }

  async getUpdateDBDate(): Promise<ResUpdateDBModel> {
    this.logger.verbose('getUpdateDBDate');
    const res: AdminSettingsModel = await jsonfile.readFile(this.adminFilePath);
    this.logger.verbose(`getUpdateDBDate: ${JSON.stringify(res)}`);
    return new ResUpdateDBModel(res);
  }


  async updateDB(): Promise<ResUpdateDBModel> {
    this.logger.verbose('setUpdateDBDate');

    const pyPath = path.join(__dirname, '..', '..', 'py', 'update_articles_db.py');
    const scriptFolderPath = path.join(__dirname, '..', '..', 'py');
    const dbFolderPath = path.join(__dirname, '..', '..', 'py', 'db');
    const mappingPath = path.join(__dirname, '..', '..', 'py', 'db', 'articles2mutations.txt');

    const pythonShellRun = promisify(PythonShell.run);
    const results = await pythonShellRun(pyPath, {args: [scriptFolderPath, dbFolderPath, mappingPath]});

    const jsonRes = JSON.parse(results.join(''));

    const adminFileJson: AdminSettingsModel = await jsonfile.readFile(this.adminFilePath);
    await jsonfile.writeFile(this.adminFilePath, {...adminFileJson, lastUpdateDB: Date.now(),  ...jsonRes  });


    return { 
      lastUpdateDate: Date.now(),
      ...jsonRes
    } as ResUpdateDBModel;

  }

  private async createDefaultAdminJSON(){
    await fs.stat(this.adminFilePath, (err, stats)=>{
      if(err) {
        this.logger.verbose(`createDefaultAdminJSON`, this.adminFilePath);
        jsonfile.writeFile(this.adminFilePath,  new AdminSettingsModel())
      }
    })
  }



}
