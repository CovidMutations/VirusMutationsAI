import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public preloaderSbj = new Subject<boolean>();

  constructor(
    private readonly translateService: TranslateService,
  ) { }

  setLoader(val: boolean): void {
    this.preloaderSbj.next(val);
  }

  extractErrorMessage(error: any): string {
    return error.error && error.error.message || this.translateService.instant('generalError');
  }
}


