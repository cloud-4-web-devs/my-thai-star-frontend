import {Component, OnDestroy, TemplateRef} from '@angular/core';
import {BookingService} from '../../services/booking.service';
import {BehaviorSubject, combineLatest, Observable, OperatorFunction, Subject} from 'rxjs';
import {Booking} from '../../model/booking';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, finalize, map, pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

const filterUrlParamName = 'filter';

@Component({
  selector: 'mts-booking-overview',
  templateUrl: './booking-overview.component.html',
  styleUrls: ['./booking-overview.component.scss']
})
export class BookingOverviewComponent implements OnDestroy {
  readonly filterInput = new FormControl();
  readonly filteredBookings$: Observable<Booking[]>;
  requestingBookingsInProgress = false;
  bookingAboutToBeCancelled: Booking | null = null;
  private readonly filterUrlParamValues$: Observable<string>;
  private readonly unsubscribe = new Subject();
  private readonly triggerRequestingAllBookings = new BehaviorSubject<void>(undefined);


  constructor(private readonly bookings: BookingService,
              private readonly currentRoute: ActivatedRoute,
              private readonly router: Router,
              private readonly modalDialog: NgbModal) {
    this.filterUrlParamValues$ = this.getFilterUrlParamValues();
    this.filteredBookings$ = this.filterTablesOnFilterUrlParamChange();
    // keep the filter URL param and the input in sync
    this.updateFilterInputOnUrlParamChange();
    this.updateFilterUrlParamOnInputChange();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.triggerRequestingAllBookings.complete();
  }

  confirmAndCancelBooking(confirmationModalDialog: TemplateRef<HTMLElement>, bookingToCancel: Booking): void {
    this.bookingAboutToBeCancelled = bookingToCancel;
    this.modalDialog.open(confirmationModalDialog).result
      .then(() => {
        this.cancelBooking().subscribe(() => this.triggerRequestingAllBookings.next());
      })
      .finally(() => this.bookingAboutToBeCancelled = null);
  }

  private cancelBooking(): Observable<void> {
    if (!this.bookingAboutToBeCancelled?.token) {
      throw new Error('Illegal state');
    }
    return this.bookings.cancel(this.bookingAboutToBeCancelled.token)
  }

  private getFilterUrlParamValues(): Observable<string> {
    return this.currentRoute.params.pipe(
      pluck(filterUrlParamName),
      map(filterValue => filterValue ? `${filterValue}`.trim() : '')
    );
  }

  private filterTablesOnFilterUrlParamChange(): Observable<Booking[]> {
    return combineLatest([this.filterUrlParamValues$, this.allBookings()])
      .pipe(applyFilterOnBookings());

    function applyFilterOnBookings(): OperatorFunction<[string, Booking[]], Booking[]> {
      return map(([filter, allBookings]) => filter ? allBookings.filter(
        booking => JSON.stringify(Object.values(booking).map(value => `${value}`.toUpperCase())).includes(filter.toUpperCase())
      ) : allBookings)
    }
  }

  private allBookings(): Observable<Booking[]> {
    return this.triggerRequestingAllBookings.asObservable().pipe(
      tap(() => this.requestingBookingsInProgress = true),
      switchMap(() => this.bookings.findAll()),
      finalize(() => this.requestingBookingsInProgress = false)
    );
  }

  private updateFilterInputOnUrlParamChange(): void {
    this.filterUrlParamValues$.pipe(takeUntil(this.unsubscribe))
      .subscribe(urlFilterValue => this.filterInput.setValue(urlFilterValue));
  }

  private updateFilterUrlParamOnInputChange(): void {
    this.filterInput.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(400),
      takeUntil(this.unsubscribe)
    ).subscribe(inputFilterValue => {
      const urlParams: Params = {};
      urlParams[filterUrlParamName] = inputFilterValue;
      this.router.navigate([urlParams], {relativeTo: this.currentRoute})
    });
  }
}
