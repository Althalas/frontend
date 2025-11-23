import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Station } from './stations.service';

export interface Booking {
  id: string;
  stationId: string;
  userId: string;
  startTime: string;
  endTime: string;
  energyRequested: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  station?: Station;
  createdAt: string;
}

export interface CreateBookingDto {
  stationId: string;
  startTime: string;
  endTime: string;
  energyRequested: number;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/bookings';

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`);
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  create(booking: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  confirm(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancel(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }

  complete(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/complete`, {});
  }

  // For hosts
  getHostBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/host`);
  }
}
