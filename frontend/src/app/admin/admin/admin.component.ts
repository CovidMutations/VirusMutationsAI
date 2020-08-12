import { Component, OnInit } from '@angular/core';
import { KeyValue } from '@angular/common';
import { DBUpdatingFrequencyEnum, UpdateDBStatusModel } from '../../models/admin-db.model';
import { AdminService } from '../admin.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  dbUpdatingFrequency = DBUpdatingFrequencyEnum;
  lastUpdateDate: number;
  dbStatus: string;
  dbStatusText: string;
  frequencyForm: FormGroup;

  constructor(
    private readonly adminService: AdminService
  ) {
    this.loadData();
   }

  ngOnInit(): void {
    this.frequencyForm = new FormGroup({
      frequency: new FormControl('')
    });
  }

  updateDB(): void {
    this.adminService.updateDB().subscribe((res: UpdateDBStatusModel) => {
      this.lastUpdateDate = res.lastUpdateDB;
      this.dbStatus = res.status;
      this.dbStatusText = res.status_text;
    });
  }

  setFrequency(): void {
    this.adminService.setFrequency(this.frequencyForm.get('frequency').value).subscribe();
  }

  loadData(): void {
    this.adminService.getFrequency().subscribe(frequency => {
      this.frequencyForm.get('frequency').setValue(frequency);
    });

    this.adminService.getUpdateDBStatus().subscribe((res: UpdateDBStatusModel) => {
      this.lastUpdateDate = res.lastUpdateDB;
      this.dbStatus = res.status;
      this.dbStatusText = res.status_text;
    });
  }

  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }

}
