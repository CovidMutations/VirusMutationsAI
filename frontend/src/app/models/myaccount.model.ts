import {BaseModel} from './base.model';


export class SubscriptionsModel extends BaseModel {
  frequency: string = undefined;
  mutations: string[] = undefined;

  constructor(row?){
    super(); super.checkFields(row);
  }
}
