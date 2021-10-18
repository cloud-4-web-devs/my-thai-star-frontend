import {Component, Input} from '@angular/core';
import {AbstractControl} from '@angular/forms';
import {Observable, OperatorFunction} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'ba-error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss']
})
export class ErrorMessagesComponent {
  $errorMessages: Observable<string[]> | undefined;

  @Input('of')
  set control(newControl: AbstractControl | undefined | null) {
    if (newControl) {
      this.$errorMessages = newControl.statusChanges
        .pipe(
          startWith(newControl.status),
          mapFromStatusToErrorMessagesOf(newControl),
        );
    }
  }
}

function mapFromStatusToErrorMessagesOf(control: AbstractControl): OperatorFunction<string, string[]> {
  return map(status => {
    if (status === 'INVALID') {
      const errors = control.errors;
      if (errors) {
        return Object.keys(errors).map(errorCode => {
          const errorMeta = errors[errorCode];
          switch (errorCode) {
            case 'required':
              return 'Please provide a value';
            case 'maxlength':
              return `Provided value is too long (${errorMeta.actualLength})`;
            case 'email':
              return `Please provide a correct email`;
            case 'ngbDate':
              return `Please provide a correct date`;
            case 'startTimeBeforeEndTime':
              return `The start time (${errorMeta.startTime}) must be before the end time (${errorMeta.endTime})`;
            default:
              return 'Unknown error';
          }
        })
      }
    }
    return [];
  })
}
