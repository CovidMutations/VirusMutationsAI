
export class MutationAnnotationArticleModel {
  // tslint:disable:variable-name
  base_mutation: string;
  base_mutation_src: string;
  article_name: string;
  article_url: string;
  // tslint:enable:variable-name
}

export class MutationAnnotationModel {
  [key: string]: MutationAnnotationArticleModel[]
}

