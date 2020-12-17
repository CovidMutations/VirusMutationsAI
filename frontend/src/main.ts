import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableAkitaProdMode, PersistStateSelectFn } from '@datorama/akita';
import { persistState } from '@datorama/akita';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { MutationAnnotationState } from './app/mutation-annotation/store/mutation-annotation.store';
import { ArticleSearchState } from './app/mutation-annotation/store/article-search.store';

if (environment.production) {
  enableAkitaProdMode();
  enableProdMode();
}

// Disable persistence for these stores. It ensures that after page reload search starts over.
const MutationAnnotationPersist: PersistStateSelectFn<MutationAnnotationState> = (state) => ({});
MutationAnnotationPersist.storeName = 'MutationAnnotation';
const ArticleSearchPersist: PersistStateSelectFn<ArticleSearchState> = (state) => ({});
ArticleSearchPersist.storeName = 'ArticleSearch';

const persistStateVal = persistState({select: [MutationAnnotationPersist, ArticleSearchPersist]});

const providers = [{provide: 'persistStorage', useValue: persistStateVal}];

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.error(err));
