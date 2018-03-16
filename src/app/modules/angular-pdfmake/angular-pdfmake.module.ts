import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AngularPDFMakeComponent } from './angular-pdfmake.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AngularPDFMakeComponent,
  ],
  exports: [
    AngularPDFMakeComponent,
  ],
  providers: [],
  entryComponents: []
})
export class AngularPDFMakeModule { }
