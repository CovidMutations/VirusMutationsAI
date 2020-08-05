import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { SharedService} from '../shared.service';

@Component({
  selector: 'app-error-modal',
  templateUrl: './error-modal.component.html',
  styleUrls: ['./error-modal.component.scss']
})
export class ErrorModalComponent implements OnInit, OnChanges {
  @Input() errMessage;
  outkey;
  constructor(
    public sharedService: SharedService,
  ) { }

  ngOnInit(): void {

  }

  ngOnChanges(change): void {
    if (change.hasOwnProperty('errMessage')){
      clearTimeout(this.outkey);
      this.outkey = setTimeout(_ => {
        this.close();
      }, 10000);
    }
  }

  close(): void {
    clearTimeout(this.outkey);
    this.sharedService.errorModal();
  }

}
