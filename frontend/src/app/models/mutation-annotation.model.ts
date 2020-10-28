
export class MutationAnnotationArticleModel {
  'base_mutation': string;
  'article_name': string;
  'article_url': string;
}

export class MutationAnnotationModel {
  [key: string]: MutationAnnotationArticleModel[]
}

