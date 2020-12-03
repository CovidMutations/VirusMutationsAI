import { Component, Input } from '@angular/core';
import { MutationAnnotationArticleModel } from '../../models/mutation-annotation.model';

@Component({
  selector: 'app-annotation-list',
  templateUrl: './annotation-list.component.html',
  styleUrls: ['./annotation-list.component.scss']
})
export class AnnotationListComponent {
  @Input() items: MutationAnnotationArticleModel[] = [];
}
