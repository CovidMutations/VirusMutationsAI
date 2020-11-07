import { Controller, Logger, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MutationAnnotationService } from './mutation-annotation.service';
import * as path from 'path';
import { diskStorage } from 'multer';
import {MutationAnnotationModel, SearchMutationDTOreq} from '../model/mutation-annotation.model';


@Controller('api')
export class MutationAnnotationController {
  private logger = new Logger('MutationAnnotationController');
  constructor(private readonly mutationAnnotationService: MutationAnnotationService) {}

  @Post('/uploadVCF')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
    destination: path.join(__dirname, '..', '..', 'assets', 'vcf'),
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${path.extname(file.originalname)}`);
      },
    }),
  }))
  uploadVCF(@UploadedFile() file, @Body('snpEffect') snpEffect): Promise<MutationAnnotationModel> {
    this.logger.verbose(`User uploaded VCF file, snpEffect: ${snpEffect}`);
    return this.mutationAnnotationService.uploadVCF(file.path, (snpEffect == 'true'));
  }


  @Post('/search-mutation')
  getArticlesByMutation(@Body() mutation: SearchMutationDTOreq): Promise<MutationAnnotationModel> {
    this.logger.verbose(`getArticlesByMutation`);
    return this.mutationAnnotationService.getArticlesByMutation(mutation.mutation);
  }
}
