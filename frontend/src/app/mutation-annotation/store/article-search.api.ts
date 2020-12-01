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
  private readonly uploadVCFapiEndpoint = '/uploadVCF';
  private readonly searchMutationApiEndpoint = '/search-mutation';
  private API_URL;

  constructor(
    private readonly http: HttpClient,
    @Inject(APP_CONFIG) config: IAppConfig,
  ) {
    this.API_URL = config.apiEndpoint;
  }

  searchByVcf(file: File, useSnpEffect = false): Observable<MutationAnnotationModel> {
    const data = new FormData();
    data.append('file', new File([file], file.name, { type: file.type }));
    data.append('snpEffect', useSnpEffect ? 'true' : 'false');

    return this.http.post<MutationAnnotationModel>(this.API_URL + this.uploadVCFapiEndpoint, data);
  }

  search(mutation: string): Observable<MutationAnnotationArticleModel[]> {
    return this.http.post(this.API_URL + this.searchMutationApiEndpoint, { mutation }).pipe(
      map(dict => Object.values(dict)[0])
    );
  }
}
