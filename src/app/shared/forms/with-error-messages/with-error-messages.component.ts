import {AfterContentInit, Component, ContentChild} from '@angular/core';
import {AbstractControl, FormControlDirective, FormControlName} from '@angular/forms';

@Component({
  selector: 'ba-with-error-messages',
  templateUrl: './with-error-messages.component.html'
})
export class WithErrorMessagesComponent implements AfterContentInit {
  @ContentChild(FormControlName)
  formControlName: FormControlName | undefined;

  @ContentChild(FormControlDirective)
  formControlDirective: FormControlDirective | undefined;

  wrappedControl: AbstractControl | undefined;

  ngAfterContentInit(): void {
    this.wrappedControl = this.formControlDirective?.control || this.formControlName?.control;
    if (!this.wrappedControl) {
      console.warn('No form control found');
    }
  }
}
