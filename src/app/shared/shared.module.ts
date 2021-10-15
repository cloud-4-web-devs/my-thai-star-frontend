import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {NgbDatepickerModule, NgbModalModule, NgbTimepickerModule} from '@ng-bootstrap/ng-bootstrap';
import {ErrorMessagesComponent} from './forms/error-messages/error-messages.component';
import {WithErrorMessagesComponent} from './forms/with-error-messages/with-error-messages.component';

@NgModule({
  declarations: [ErrorMessagesComponent, WithErrorMessagesComponent],
  imports: [
    CommonModule
  ],
  exports: [
    CommonModule, RouterModule, ReactiveFormsModule, NgbDatepickerModule, NgbTimepickerModule, NgbModalModule,
    ErrorMessagesComponent, WithErrorMessagesComponent,
  ]
})
export class SharedModule {
}
