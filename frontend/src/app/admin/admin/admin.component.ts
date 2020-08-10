import { Component, OnInit } from '@angular/core';
import { DBUpdatingFrequencyEnum } from '../../models/admin-db.model';
import { AdminService } from '../admin.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  dbUpdatingFrequency = DBUpdatingFrequencyEnum;
  lastUpdateDate = '';
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
    this.adminService.updateDB().subscribe(lastUpdateDate => {
      console.log('lastUpdateDate= ', lastUpdateDate)
      this.lastUpdateDate = lastUpdateDate;
    });
  }

  setFrequency(): void {
    this.adminService.setFrequency(this.frequencyForm.get('frequency').value).subscribe();
  }

  loadData(): void {
    this.adminService.getFrequency().subscribe(frequency => {
      this.frequencyForm.get('frequency').setValue(frequency);
    });

    this.adminService.getUpdateDBDate().subscribe(lastUpdateDate => {
      this.lastUpdateDate = lastUpdateDate;
    });
  }

}
