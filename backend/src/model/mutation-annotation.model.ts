import {IsString, IsEmail, IsBoolean, IsNotEmpty, IsEmpty, IsBooleanString} from 'class-validator';

export interface MutationAnnotationArticleModel {
  'article_name': string;
  'article_url': string;
}

export class MutationAnnotationModel {
  [key: string]: MutationAnnotationArticleModel[]
}

export class SearchMutationDTOreq {
  @IsString()
  mutation: string;

}

