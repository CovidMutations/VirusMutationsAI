import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as csvdata from 'csvdata';
import {SchedulerRegistry} from '@nestjs/schedule';
import { CronTime } from 'cron';
import {PythonShell} from 'python-shell';
import {promisify} from 'util';
import {SetFrequencyDTO, DBUpdatingFrequencyEnum, AdminSettingsModel, DBUpdatingCronEnum, ResUpdateDBModel} from '../model/admin.model';


@Injectable()
export class AdminService {
  private logger = new Logger('AdminService');
  private adminFilePath = path.join(__dirname, '..', '..', 'assets', 'admin.csv');
  private csvOption = { header: 'frequency,lastUpdateDB,status,status_text'};

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    this.createDefaultAdminCSV();
  }

  async getFrequency(): Promise<string> {
    this.logger.verbose('getFrequency');
    const res: AdminSettingsModel[] = await csvdata.load(this.adminFilePath, this.csvOption);
    return res[0].frequency;
  }

  async setFrequency(res: SetFrequencyDTO): Promise<string> {
    this.logger.verbose('setFrequency');
    const csv: AdminSettingsModel[] = await csvdata.load(this.adminFilePath, this.csvOption);
    await csvdata.write(this.adminFilePath, [{...csv[0], ...res}], this.csvOption);

    const job = this.schedulerRegistry.getCronJob('updateDBCron');
    job.setTime(new CronTime(DBUpdatingCronEnum[res.frequency]));
    job.start();

    return res.frequency
  }

  async getUpdateDBDate(): Promise<ResUpdateDBModel> {
    this.logger.verbose('getUpdateDBDate');
    const res: AdminSettingsModel[] = await csvdata.load(this.adminFilePath, this.csvOption);
    this.logger.verbose(`getUpdateDBDate: ${JSON.stringify(res)}`);
    return new ResUpdateDBModel(res[0]);
  }


  async updateDB(): Promise<ResUpdateDBModel> {
    this.logger.verbose('setUpdateDBDate');

    const pyPath = path.join(__dirname, '..', '..', 'scripts', 'update_articles_db.py');
    const scriptFolderPath = path.join(__dirname, '..', '..', 'scripts');
    const dbFolderPath = path.join(__dirname, '..', '..', 'db');
    const mappingPath = path.join(__dirname, '..', '..', 'db', 'articles2mutations.txt');

    const pythonShellRun = promisify(PythonShell.run);
    const results = await pythonShellRun(pyPath, {args: [scriptFolderPath, dbFolderPath, mappingPath]});

    const jsonRes = JSON.parse(results.join(''));

    const csv: AdminSettingsModel[] = await csvdata.load(this.adminFilePath, this.csvOption);
    await csvdata.write(this.adminFilePath, [{...csv[0], lastUpdateDB: Date.now(),  status: jsonRes['status'], status_text: '"' + jsonRes['status_text'] + '"' }], this.csvOption);


    return { 
      lastUpdateDate: Date.now(),
      ...jsonRes
    } as ResUpdateDBModel;

  }

  private async createDefaultAdminCSV(){
    await fs.stat(this.adminFilePath, (err, stats)=>{
      if(err) {
        this.logger.verbose(`createDefaultAdminCSV`);
        csvdata.write(this.adminFilePath, [ new AdminSettingsModel()], this.csvOption)
      }
    })
  }



}
