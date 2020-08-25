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
    return await this.getArticles(file);
  }

  async getArticlesByMutation(mutation: string): Promise<MutationAnnotationModel> {
    this.logger.verbose('getArticlesByMutation');
    return await this.getArticles(mutation);
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

  private async getArticles(fileOrMutation) {
    let isFile = typeof fileOrMutation !== 'string';

    const pyPath = path.join(__dirname, '..', '..', 'py', 'vcf_to_articles_json.py');
    const indexPath = '--article_index_file_name=' + path.join(__dirname,'..', '..', 'py', 'db', 'index.csv');
    const mappingPath = '--article_mutations_file_name=' + path.join(__dirname,'..', '..', 'py', 'db', 'articles2mutations.txt');
    const filePath = (isFile) ? path.join(__dirname, '..', '..', 'py', fileOrMutation) :  fileOrMutation ;
    
    const pythonShellRun = promisify(PythonShell.run);
    const results = await pythonShellRun(pyPath, {args: [filePath, indexPath, mappingPath]});

    if (results && isFile)  { this.removeVCF(filePath); }

    const jsonRes = JSON.parse(results.join(''));

    if('error_text' in jsonRes) {
      throw new InternalServerErrorException(jsonRes,jsonRes.error_text);
    }

    return jsonRes;
  }

}
// vcf_to_articles_json.py "11083G>T" --article_index_file_name=db/index.csv --article_mutations_file_name=db/articles2mutations.txt