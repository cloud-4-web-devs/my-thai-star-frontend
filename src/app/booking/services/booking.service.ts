import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Table} from '../model/table';
import {environment} from '../../../environments/environment';
import {Booking, BookingConfirmation, BookingRequest} from '../model/booking';

@Injectable()
export class BookingService {
  private readonly backendUri = `${environment.backendUri}/booking`;

  constructor(private readonly http: HttpClient) {
  }

  findAllTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.backendUri}/tables`);
  }

  findAll(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.backendUri}/bookings`);
  }

  createRequest(request: BookingRequest): Observable<BookingConfirmation> {
    return this.http.post<BookingConfirmation>(`${this.backendUri}/booking`, request);
  }

  cancel(token: string): Observable<void> {
    return this.http.post<void>(`${this.backendUri}/booking/cancel/${token}`, {});
  }
}
