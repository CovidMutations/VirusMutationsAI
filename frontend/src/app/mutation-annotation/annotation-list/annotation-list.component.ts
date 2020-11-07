import { Component, Input } from '@angular/core';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';

@Component({
  selector: 'app-annotation-list',
  templateUrl: './annotation-list.component.html',
})
export class AnnotationListComponent {
  @Input() items: MutationAnnotationModel[] = [];
}
