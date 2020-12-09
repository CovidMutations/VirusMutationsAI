import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_CONFIG, IAppConfig } from '../../app.config';
import { MutationAnnotationArticleModel, MutationAnnotationModel } from '../../models/mutation-annotation.model';

@Injectable({
  providedIn: 'root'
})
export class ArticleSearchApi {
  private readonly uploadVCFapiEndpoint = '/v1/articles/search-by-file';
  private readonly articleSearchApi = '/v1/articles/search';
  private readonly API2_URL: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) config: IAppConfig,
  ) {
    this.API2_URL = config.apiEndpoint2;
  }

  searchByVcf(file: File, useSnpEffect = false): Observable<MutationAnnotationModel> {
    const data = new FormData();
    data.append('file', new File([file], file.name, { type: file.type }));
    data.append('snpEffect', useSnpEffect ? 'true' : 'false');

    return this.http.post<MutationAnnotationModel>(this.API2_URL + this.uploadVCFapiEndpoint, data);
  }

  search(mutation: string): Observable<MutationAnnotationArticleModel[]> {
    return this.http.post(this.API2_URL + this.articleSearchApi, { mutation }).pipe(
      map(dict => Object.values(dict)[0])
    );
  }
}
