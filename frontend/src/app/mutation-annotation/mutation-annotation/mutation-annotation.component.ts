import { Component, OnInit } from '@angular/core';
import { KeyValuePipe} from '@angular/common';
import { FileUploadModel } from '../../models/file-upload.model';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import { HashMap } from '@datorama/akita';

@Component({
  selector: 'app-mutation-annotation',
  templateUrl: './mutation-annotation.component.html',
  styleUrls: ['./mutation-annotation.component.scss'],
  providers: [KeyValuePipe]
})
export class MutationAnnotationComponent implements OnInit {
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

  uploadVCF(e): void {
    const file: FileUploadModel = e.srcElement.files[0];
    const ext = file.name && file.name.split('.')[1];
    if (ext === 'vcf') {
      this.mutationAnnotationService.uploadVCF(file).subscribe(list => {
        this.listArticles = list;
      });

    }
  }

  onFilterListArticles(val): void {
    this.listArticles = Object['fromEntries'](Object.entries(this.listArticlesOrigin).filter(([key]) => {
      return key.indexOf(val) > -1;
    }) );
    this.setActiveItem();
  }

}

