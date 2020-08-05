import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
  exports: [ ...importModules, ...importComponents]
})
export class SharedModule { }

