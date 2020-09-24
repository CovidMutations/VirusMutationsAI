import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DBUpdatingFrequencyEnum } from '../../models/admin-db.model';
import { ToolService } from '../../shared/tool.service';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.component.html',
  styleUrls: ['./subscribe.component.scss']
})
export class SubscribeComponent implements OnInit {
  dbUpdatingFrequency = DBUpdatingFrequencyEnum;
  subscribeForm: FormGroup;
  mutations = new FormArray([]);

  constructor(
    readonly toolService: ToolService
  ) {
    this.subscribeForm = new FormGroup({
      frequency: new FormControl('',  Validators.required),
      mutations: this.mutations
    });
    this.addNewMutation();

   }

  ngOnInit(): void {
  }

  addNewMutation(): void {
    this.mutations.push(new FormControl('', Validators.required));
  }

  onSubmit(): void {
    console.log(this.subscribeForm.value);
    // this.authService.saveSubscriptions(this.subscribeForm.value).subscribe(data => {
    //   console.log('registration', data);

    // });
  }

}
