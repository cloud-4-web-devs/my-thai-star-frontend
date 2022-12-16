import {Component} from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {NgbDate, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {add, format, isBefore} from 'date-fns';
import {BookingRequest} from '../../model/booking';
import {BookingService} from '../../services/booking.service';
import {finalize} from 'rxjs/operators';

interface BookingForm {
  email: string | null;
  bookingDate: NgbDate | null;
  bookingTimeFrom: NgbTimeStruct | null;
  bookingTimeTo: NgbTimeStruct | null;
  seatsNumber: string | null;
}

@Component({
  selector: 'mts-table-booking',
  templateUrl: './table-booking.component.html',
  styleUrls: ['./table-booking.component.scss']
})
export class TableBookingComponent {
  requestIsBeingProcessed = false;
  backendErrors: string[] = [];
  readonly bookingForm: FormGroup;

  constructor(private readonly currentRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly bookings: BookingService) {
    this.bookingForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      bookingDate: new FormControl(null, Validators.required),
      bookingTimeFrom: new FormControl(null, Validators.required),
      bookingTimeTo: new FormControl(null, Validators.required),
      seatsNumber: new FormControl(null, Validators.required),
    }, [startTimeBeforeEndTime]);
    this.bookingForm.setValue(getDefaultFormValues());
  }

  book(): void {
    if (this.bookingForm.valid) {
      const bookingForm = this.bookingForm.value as BookingForm;
      const bookingRequest = this.fromBookingFormToBookingRequest(bookingForm);
      this.disableFormAndClearBackendErrorsIfAny();
      this.bookings.createRequest(bookingRequest)
        .pipe(finalize(() => this.enableForm()))
        .subscribe(bookingConfirmation => {
          return this.router.navigate(['../..', {filter: bookingConfirmation.token}])
        }, error => {
          if (error.status === 400) {
            this.backendErrors = [error?.error ?? 'Server could not process your request'];
          }
        });
    }
  }

  private fromBookingFormToBookingRequest(bookingForm: BookingForm): BookingRequest {
    const bookingDateFrom = createDatetimeFrom(bookingForm.bookingDate, bookingForm.bookingTimeFrom);
    const bookingDateTo = createDatetimeFrom(bookingForm.bookingDate, bookingForm.bookingTimeTo);
    const bookingRequest: BookingRequest = {
      email: getSafeStringOf(bookingForm.email),
      bookingFrom: bookingDateFrom.toISOString(),
      bookingTo: bookingDateTo.toISOString(),
      seatsNumber: parseIntegerFrom(bookingForm.seatsNumber)
    }
    this.addSuggestedTableTo(bookingRequest);

    return bookingRequest;
  }

  private disableFormAndClearBackendErrorsIfAny() {
    this.bookingForm.disable();
    this.requestIsBeingProcessed = true;
    this.backendErrors = [];
  }

  private enableForm() {
    this.bookingForm.enable();
    this.requestIsBeingProcessed = false;
  }

  private addSuggestedTableTo(bookingRequest: BookingRequest) {
    const suggestedTableAsString = this.currentRoute.snapshot.params['suggestedTable'];
    if (suggestedTableAsString) {
      const suggestedTable = parseInt(suggestedTableAsString, 10);
      if (!isNaN(suggestedTable)) {
        bookingRequest.suggestedTable = suggestedTable;
      }
    }
  }
}

function startTimeBeforeEndTime(form: AbstractControl): ValidationErrors | null {
  const bookingDate = form.get('bookingDate')?.value;
  const bookingTimeFrom = form.get('bookingTimeFrom')?.value;
  const bookingTimeTo = form.get('bookingTimeTo')?.value;
  if (bookingDate && bookingTimeFrom && bookingTimeTo) {
    const bookingDateFrom = createDatetimeFrom(bookingDate, bookingTimeFrom);
    const bookingDateTo = createDatetimeFrom(bookingDate, bookingTimeTo);
    if (!isBefore(bookingDateFrom, bookingDateTo)) {
      return {
        startTimeBeforeEndTime: {
          startTime: format(bookingDateFrom, 'HH:mm'),
          endTime: format(bookingDateTo, 'HH:mm')
        }
      };
    }
  }

  return null;
}

function createDatetimeFrom(date: NgbDate | null, time: NgbTimeStruct | null): Date {
  if (!date || !time) {
    throw new Error('Date or time or both are missing!')
  }
  return new Date(date.year, date.month - 1, date.day, time.hour, time.minute);
}

function getSafeStringOf(something: string | null): string {
  if (!something) {
    throw new Error('Assertion failed!');
  }
  return something;
}

function parseIntegerFrom(something: string | null): number {
  const integerAsString = getSafeStringOf(something);
  const integer = parseInt(integerAsString, 10);
  if (isNaN(integer)) {
    throw new Error(`${integerAsString}  could not be parsed as an integer`)
  }
  return integer;
}

function getDefaultFormValues(): BookingForm {
  let bookingStartDate = add(new Date(), {days: 1, minutes: 15});
  let bookingStartHour = bookingStartDate.getHours() + 1;
  let bookingEndHour = bookingStartDate.getHours() + 2;
  if (bookingStartDate.getHours() === 23) {
    bookingStartDate = add(bookingStartDate, {days: 1});
    bookingStartHour = 9;
    bookingEndHour = 10;
  }
  return {
    email: null,
    bookingDate: new NgbDate(bookingStartDate.getFullYear(), bookingStartDate.getMonth() + 1, bookingStartDate.getDate()),
    bookingTimeFrom: {hour: bookingStartHour, minute: 0, second: 0},
    bookingTimeTo: {hour: bookingEndHour, minute: 0, second: 0},
    seatsNumber: `${2}`
  }
}
