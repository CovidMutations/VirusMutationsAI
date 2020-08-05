import { Controller, Logger, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MutationAnnotationService } from './mutation-annotation.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {MutationAnnotationModel} from '../model/mutation-annotation.model';


@Controller('api')
export class MutationAnnotationController {
  private logger = new Logger('MutationAnnotationController');
  constructor(private readonly mutationAnnotationService: MutationAnnotationService) {}

  @Post('/uploadVCF')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './assets/vcf',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadVCF(@UploadedFile() file): Promise<MutationAnnotationModel> {
    this.logger.verbose(`User uploaded VCF file`);
    return this.mutationAnnotationService.uploadVCF(file.path);
  }
}
