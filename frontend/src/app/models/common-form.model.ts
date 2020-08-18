import { ValidatorFn } from '@angular/forms';

export enum TypeFieldEnum {
  Select = 'Select',
  Radio = 'Radio',
  Text = 'Text',
  Date = 'Date'
}


export class CommonFormInputModel {
  value: any;
  type: string;
  options?: CommonFormInputOptionModel[];
  validation?: ValidatorFn;
}

export class CommonFormOutputModel {

}

export class CommonFormInputOptionModel {
  name: string;
  id: any;

  constructor(id?: any, name?: string) {
      // if (typeof id === 'boolean') {
      //     this.name = name ? name : id ? 'Yes' : 'No';
      //     this.id = id;
      // } else
      if (name && id) {
          this.name = name;
          this.id = id;
      } else if (id) {
          this.name = String(id);
          this.id = id;
      } else if (name) {
          this.name = name;
          this.id = name;
      }
  }
}

