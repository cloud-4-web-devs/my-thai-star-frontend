import {ModuleWithProviders, NgModule} from '@angular/core';
import {TableOverviewComponent} from './components/table-overview/table-overview.component';
import {BookingOverviewComponent} from './components/booking-overview/booking-overview.component';
import {BookingService} from './services/booking.service';
import {TableItemComponent} from './components/table-overview/table-item/table-item.component';
import {SharedModule} from '../shared/shared.module';
import {TableBookingComponent} from './components/table-booking/table-booking.component';
import {BookingItemComponent} from './components/booking-overview/booking-item/booking-item.component';

@NgModule({
  declarations: [
    TableOverviewComponent,
    BookingOverviewComponent,
    TableItemComponent,
    TableBookingComponent,
    BookingItemComponent
  ],
  imports: [
    SharedModule
  ]
})
export class BookingModule {
  static forRoot(): ModuleWithProviders<BookingModule> {
    return {
      ngModule: BookingModule,
      providers: [BookingService],
    }
  }
}
