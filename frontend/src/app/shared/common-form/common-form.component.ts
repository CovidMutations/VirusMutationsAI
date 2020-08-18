import { Component, OnInit, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TypeFieldEnum, CommonFormInputModel, CommonFormOutputModel } from '../../models/common-form.model';

@Component({
  selector: 'app-common-form',
  templateUrl: './common-form.component.html',
  styleUrls: ['./common-form.component.scss']
})
export class CommonFormComponent implements OnInit, OnChanges {
  @Output() formOutput = new EventEmitter<CommonFormOutputModel>();
  @Input() initialFormData: Map<string, CommonFormInputModel> ;
 
  // buildFilterData: [string, InitDataFilterFieldSelectModel][];
  enumTypeField = TypeFieldEnum;
  commonForm: FormGroup;
  // Array = Array;



  constructor() { }

  ngOnInit(): void {
  }
  ngOnChanges(change): void {
    // if (change.hasOwnProperty('reset') && this.reset) {
    //   this.inputParametersForm.reset();
    //   this.reset = false;

    // } else
    if (this.initialFormData.size) {
      this.buildForm(this.initialFormData);
    }
  }

  private buildForm(initialFormData: Map<string, CommonFormInputModel> ) {
    
    const filterControls: Map<string, FormControl> = new Map();
    initialFormData.forEach((fieldVal, fieldName) => {
      filterControls.set(fieldName, new FormControl(fieldVal.value, fieldVal.validation));
    });

    console.log('filterControls',filterControls )
    

  //  this.buildFilterData = Array.from(initialFilter);

    this.commonForm = new FormGroup(Object['fromEntries'](filterControls));
    console.log(this.commonForm)
    this.formOutput.emit(this.commonForm);

    this.commonForm.valueChanges.subscribe(value => {
        this.formOutput.emit(this.commonForm);
    });

  }


}
