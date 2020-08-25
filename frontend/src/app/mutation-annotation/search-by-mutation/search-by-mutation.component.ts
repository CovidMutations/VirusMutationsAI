import { Component, OnInit } from '@angular/core';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import { HashMap } from '@datorama/akita';
import { KeyValuePipe} from '@angular/common';

@Component({
  selector: 'app-search-by-mutation',
  templateUrl: './search-by-mutation.component.html',
  styleUrls: ['./search-by-mutation.component.scss']
})
export class SearchByMutationComponent implements OnInit {

    private listArticlesOrigin: HashMap<MutationAnnotationModel>;
    listArticles: HashMap<MutationAnnotationModel>;
    activeItem = '';

    constructor(
      private readonly mutationAnnotationService: MutationAnnotationService,
      private readonly keyValuePipe: KeyValuePipe,
    ) {
      this.mutationAnnotationService.getMutationAnnotationArticles().subscribe(list => {
        this.listArticlesOrigin = list;
        this.listArticles = this.listArticlesOrigin;
        this.setActiveItem();
      });
    }

    private setActiveItem(): void {
      if (Object.keys(this.listArticles).length) {
        this.activeItem = this.keyValuePipe.transform(this.listArticles)[0].key;
      }
    }

    ngOnInit(): void {
    }



    onFilterListArticles(val): void {
      if (val.length >= 3) {
        this.mutationAnnotationService.searchMutationAnnotationArticles(val).subscribe(list => {

        })
      }

     // this.setActiveItem();
    }

}
