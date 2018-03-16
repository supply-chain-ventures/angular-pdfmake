import { Component, Inject, LOCALE_ID, ViewChild } from '@angular/core';

import { AngularPDFMakeComponent } from './modules/angular-pdfmake/angular-pdfmake.component'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  // Reports
  @ViewChild('report') report: AngularPDFMakeComponent;

  constructor() {}

  
}
