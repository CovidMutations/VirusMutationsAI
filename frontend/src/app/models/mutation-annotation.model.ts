
export class MutationAnnotationArticleModel {
  'article_name': string;
  'article_url': string;
}

export class MutationAnnotationModel {
  [key: string]: MutationAnnotationArticleModel[]
}

