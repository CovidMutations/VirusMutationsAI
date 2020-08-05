import { Module } from '@nestjs/common';
// import { MutationAnnotationResolver } from './mutation-annotation.resolver';
import { MutationAnnotationService } from './mutation-annotation.service';
import { MutationAnnotationController } from './mutation-annotation.controller';

@Module({
  controllers: [MutationAnnotationController],
  providers: [MutationAnnotationService, MutationAnnotationController],
})
export class MutationAnnotationModule {


}
