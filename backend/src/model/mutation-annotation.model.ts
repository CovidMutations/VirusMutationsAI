import {IsString, IsEmail, IsBoolean, IsNotEmpty, IsEmpty, IsBooleanString} from 'class-validator';

export interface MutationAnnotationArticleModel {
  base_mutation: string;
  base_mutation_src?: string;
  article_name: string;
  article_url: string;
}

export class MutationAnnotationModel {
  [key: string]: MutationAnnotationArticleModel[]
}

export class SearchMutationDTOreq {
  @IsString()
  mutation: string;

}

