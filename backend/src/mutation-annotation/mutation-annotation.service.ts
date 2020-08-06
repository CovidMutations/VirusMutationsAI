import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import {promisify} from 'util';
import {MutationAnnotationModel} from '../model/mutation-annotation.model';

@Injectable()
export class MutationAnnotationService {
  private logger = new Logger('MutationAnnotationService');

  async uploadVCF(file): Promise<MutationAnnotationModel> {
    
    this.logger.verbose('uploadVCF');

    const pyPath = path.join(__dirname, '..', '..', 'scripts', 'vcf_to_articles_json.py');
    const indexPath = '--article_index_file_name=' + path.join(__dirname, '..', '..', 'db', 'index.csv');
    const mappingPath = '--article_mutations_file_name=' + path.join(__dirname, '..', '..', 'db', 'articles2mutations.txt');
    const filePath = path.join(__dirname, '..', '..', file);
    
    const pythonShellRun = promisify(PythonShell.run);
    const results = await pythonShellRun(pyPath, {args: [filePath, indexPath, mappingPath]});

    if (results)  { this.removeVCF(filePath); }

    const jsonRes = JSON.parse(results.join(''));

    if('error_text' in jsonRes) {
      throw new InternalServerErrorException(jsonRes,jsonRes.error_text);
    }

    return jsonRes;
  }

  private removeVCF(file): void {
    this.logger.verbose('removeVCF');
    fs.unlink(file, (err) => {
      if (err) {
        this.logger.error(err, 'error in file removed');
      }
      this.logger.verbose(file, 'file removed');
    });
  }

}
