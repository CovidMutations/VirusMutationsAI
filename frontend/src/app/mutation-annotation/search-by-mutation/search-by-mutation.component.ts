import { Component, OnInit } from '@angular/core';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import {  BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

@Component({
  selector: 'app-search-by-mutation',
  templateUrl: './search-by-mutation.component.html',
  styleUrls: ['./search-by-mutation.component.scss']
})
export class SearchByMutationComponent implements OnInit {
    private mutationBS = new BehaviorSubject('');
    listArticles: MutationAnnotationModel[] = undefined;
    activeItem = '';

    constructor(
      private readonly mutationAnnotationService: MutationAnnotationService,
    ) {
      this.mutationBS.pipe(
        distinctUntilChanged(),
        filter(mutation => /^[^>]+>{1,1}[^>]+$/gmi.test(mutation))
      ).subscribe(mutation => {
          this.mutationAnnotationService.searchMutationAnnotationArticles(mutation).subscribe(list => {
            this.listArticles = list || [];
          });
      });
    }

    ngOnInit(): void {
    }

    onFilterListArticles(val): void {
      this.mutationBS.next(val.trim());
    }

}
