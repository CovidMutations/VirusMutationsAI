import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe} from '@angular/common';

const importComponents = [

];

const importModules = [
  TranslateModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
];

@NgModule({
  declarations: importComponents,
  imports: [...importModules, CommonModule],
  exports: [ ...importModules, ...importComponents],
  providers: [KeyValuePipe]

})
export class SharedModule { }

