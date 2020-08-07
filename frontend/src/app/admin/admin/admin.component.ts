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

  updateDB() {
    this.adminService.updateDB().subscribe(lastUpdateDate => {
      this.lastUpdateDate = lastUpdateDate;
    });
  }

  setFrequency() {
 //   this.adminService.setFrequency(this.frequencyForm.get('frequency').value).subscribe();
  }

  loadData() {
    this.adminService.getFrequency().subscribe(frequency => {
      this.frequencyForm.get('frequency').setValue(frequency);
      console.log( this.frequencyForm)
    });

    this.adminService.getUpdateDBDate().subscribe(lastUpdateDate => {
      this.lastUpdateDate = lastUpdateDate;
    });
  }

}
