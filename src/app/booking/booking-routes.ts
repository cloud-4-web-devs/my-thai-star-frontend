import {Routes} from '@angular/router';
import {BookingOverviewComponent} from './components/booking-overview/booking-overview.component';
import {TableOverviewComponent} from './components/table-overview/table-overview.component';
import {TableBookingComponent} from './components/table-booking/table-booking.component';

export const bookingRoutes: Routes = [
  {path: '', component: BookingOverviewComponent},
  {
    path: 'tables', children: [
      {path: '', component: TableOverviewComponent},
      {path: 'book', component: TableBookingComponent}
    ]
  }
]
