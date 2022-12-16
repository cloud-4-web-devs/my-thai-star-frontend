import {Component, OnDestroy} from '@angular/core';
import {BookingService} from '../../services/booking.service';
import {combineLatest, Observable, of, OperatorFunction, Subject} from 'rxjs';
import {Table} from '../../model/table';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, finalize, map, pluck, switchMap, takeUntil, tap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

const filterUrlParamName = 'filter';

@Component({
  selector: 'mts-table-overview',
  templateUrl: './table-overview.component.html',
  styleUrls: ['./table-overview.component.scss']
})
export class TableOverviewComponent implements OnDestroy {
  readonly filterInput = new FormControl();
  readonly filteredTables$: Observable<Table[]>;
  requestingTablesInProgress = false;
  private readonly filterUrlParamValues$: Observable<string>;
  private readonly unsubscribe = new Subject<void>();

  constructor(private readonly bookings: BookingService,
              private readonly currentRoute: ActivatedRoute,
              private readonly router: Router) {
    this.filterUrlParamValues$ = this.getFilterUrlParamValues();
    this.filteredTables$ = this.filterTablesOnFilterUrlParamChange();
    // keep the filter URL param and the input in sync
    this.updateFilterInputOnUrlParamChange();
    this.updateFilterUrlParamOnInputChange();
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private getFilterUrlParamValues(): Observable<string> {
    return this.currentRoute.params.pipe(
      pluck(filterUrlParamName),
      map(filterValue => filterValue ? `${filterValue}`.trim() : '')
    );
  }

  private filterTablesOnFilterUrlParamChange(): Observable<Table[]> {
    return combineLatest([this.filterUrlParamValues$, this.allTables()])
      .pipe(applyFilterOnTables());

    function applyFilterOnTables(): OperatorFunction<[string, Table[]], Table[]> {
      return map(([filter, allTables]) => allTables.filter(table => `${table.maxSeats}`.includes(filter)))
    }
  }

  private allTables(): Observable<Table[]> {
    return of(null).pipe(
      tap(() => this.requestingTablesInProgress = true),
      switchMap(() => this.bookings.findAllTables()),
      finalize(() => this.requestingTablesInProgress = false)
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
