import { Component, OnInit } from '@angular/core';
import { KeyValuePipe} from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs/operators';
import { FileUploadModel } from '../../models/file-upload.model';
import { MutationAnnotationService } from '../mutation-annotation.service';
import { MutationAnnotationModel } from '../../models/mutation-annotation.model';
import { HashMap } from '@datorama/akita';
import { SharedService } from '../../shared/shared.service';

@Component({
  selector: 'app-mutation-annotation',
  templateUrl: './mutation-annotation.component.html',
  styleUrls: ['./mutation-annotation.component.scss'],
})
export class MutationAnnotationComponent implements OnInit {
  private listArticlesOrigin: HashMap<MutationAnnotationModel>;
  listArticles: HashMap<MutationAnnotationModel>;
  activeItem = '';
  snpEffect = false;

  constructor(
    private readonly mutationAnnotationService: MutationAnnotationService,
    private readonly keyValuePipe: KeyValuePipe,
    private readonly sharedService: SharedService,
    private toastr: ToastrService,
  ) {
    this.mutationAnnotationService.getMutationAnnotationArticles().subscribe(list => {
      this.listArticlesOrigin = list;
      this.listArticles = this.listArticlesOrigin;
      this.setActiveItem();
    });
  }

  isEmpty(object): boolean {
    return Object.keys(object).length === 0;
  }

  private setActiveItem(): void {
    if (Object.keys(this.listArticles).length) {
      this.activeItem = this.keyValuePipe.transform(this.listArticles)[0].key;
    }
  }

  ngOnInit(): void {
  }

  changeSnpEffect(): void {
    this.snpEffect = !this.snpEffect;
  }

  uploadVCF(e): void {
    const file: FileUploadModel = e.target.files[0];
    const ext = file.name && file.name.split('.')[1].toLowerCase();
    if (ext === 'vcf') {
      this.mutationAnnotationService.uploadVCF(file, this.snpEffect).pipe(take(1)).subscribe(
        list => this.listArticles = list,
        err => this.toastr.error(this.sharedService.extractErrorMessage(err))
      );
      e.target.value = null;
    }
  }

  onFilterListArticles(val): void {
    this.listArticles = Object['fromEntries'](Object.entries(this.listArticlesOrigin).filter(([key]) => {
      return key.indexOf(val) > -1;
    }) );
    this.setActiveItem();
  }

}

