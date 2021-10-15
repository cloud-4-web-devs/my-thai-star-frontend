export interface Booking {
  maxSeats: number;
  tableId: number;
  bookingFrom: string; // date as ISO
  bookingTo: string; // date as ISO
  token: string;
  status: BookingStatus;
}

export type BookingStatus = 'NEW' | 'CANCELLED' | 'CONFIRMED' | 'REALIZED'

export interface BookingRequest {
  email: string;
  bookingFrom: string; // date as ISO
  bookingTo: string; // date as ISO
  seatsNumber: number;
  suggestedTable?: number;
}

export interface BookingConfirmation {
  token: string;
}
