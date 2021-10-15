import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Booking, BookingStatus} from '../../../model/booking';
import {format} from 'date-fns';

type CssClasses = {[cssClass: string]: boolean};

interface BookingItem {
  date: string;
  timeFrom: string;
  timeTo: string;
  tableId: number;
  token: string;
  seats: number;
  status: BookingStatus;
  statusCssClass: CssClasses
}

const statusToCssClass: {[status: string]: string} = {
  NEW: 'bg-success',
  CANCELLED: 'bg-danger',
  UNKNOWN: 'ng-light'
}

@Component({
  selector: 'mts-booking-item',
  templateUrl: './booking-item.component.html',
  styleUrls: ['./booking-item.component.scss']
})
export class BookingItemComponent implements OnDestroy {


  booking: BookingItem | undefined;

  @Output()
  cancelClick = new EventEmitter<string>();

  @Input()
  set of(newBooking: Booking | undefined) {
    if (newBooking) {
      const bookingStartDate = new Date(newBooking.bookingFrom);
      const bookingEndDate = new Date(newBooking.bookingTo);
      const statusCssClass: CssClasses = {};
      statusCssClass[statusToCssClass[newBooking.status] ?? statusToCssClass['UNKNOWN']] = true;

      this.booking = {
        date: format(bookingStartDate, 'yyyy-MM-dd'),
        timeFrom: format(bookingStartDate, 'HH:mm'),
        timeTo: format(bookingEndDate, 'HH:mm'),
        tableId: newBooking.tableId,
        token: newBooking.token,
        status: newBooking.status,
        statusCssClass,
        seats: newBooking.maxSeats
      }
    }
  }

  cancel(bookingToken: string | undefined): void {
    if (bookingToken) {
      this.cancelClick.next(bookingToken);
    }
  }

  ngOnDestroy(): void {
    this.cancelClick.complete();
  }
}
