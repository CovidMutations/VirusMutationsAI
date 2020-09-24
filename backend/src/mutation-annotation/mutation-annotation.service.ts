import { Injectable, Logger, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import {PythonShell} from 'python-shell';
import {promisify} from 'util';
import {MutationAnnotationModel} from '../model/mutation-annotation.model';

@Injectable()
export class MutationAnnotationService {
  private logger = new Logger('MutationAnnotationService');

  async uploadVCF(file, snpEffect: boolean): Promise<MutationAnnotationModel> {
    
    this.logger.verbose('uploadVCF');
    return await this.getArticles(file, snpEffect);
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

  private async getArticles(fileOrMutation, snpEffect?: boolean) {
    let isFile = typeof fileOrMutation !== 'string';

    console.log(isFile ,' && ', snpEffect,' fileOrMutation-> ',fileOrMutation);

    const pyPath =  path.join(__dirname, '..', '..', 'py', 'vcf_to_articles_json.py') ;
    const filePath =  (isFile) ? path.join(__dirname, '..', '..', 'py', fileOrMutation) :  fileOrMutation;

    const args = [];
    args.push( '--article_index_file_name=' + path.join(__dirname,'..', '..', 'py', 'db', 'index.csv') );
    args.push(  '--article_mutations_file_name=' + path.join(__dirname,'..', '..', 'py', 'db', 'articles2mutations.txt') );
    args.push( filePath );
    if (isFile && snpEffect) {
      args.push( '--snp_eff_jar_path=' + path.join(__dirname,'..', '..', 'py', 'snpEff', 'snpEff.jar') );
    }
console.log({args})
    const pythonShellRun = promisify(PythonShell.run);
    const results = await pythonShellRun(pyPath, {args});

    if (results && isFile)  { this.removeVCF(filePath); }

    const jsonRes = JSON.parse(results.join(''));

    if('error_text' in jsonRes) {
      throw new InternalServerErrorException(jsonRes,jsonRes.error_text);
    }

    return jsonRes;
  }

}
// vcf_to_articles_json.py "11083G>T" --article_index_file_name=db/index.csv --article_mutations_file_name=db/articles2mutations.txt