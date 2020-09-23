import { Injectable } from '@angular/core';
import { KeyValue } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  }

}


