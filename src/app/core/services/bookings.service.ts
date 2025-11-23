import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Station } from './stations.service';

export interface Booking {
  id: number;
  stationId: number;
  userId: number;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'refused' | 'completed' | 'cancelled';
  station?: Station;
  createdAt: string;
}

export interface CreateBookingDto {
  stationId: number;
  startTime: string;
  endTime: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/bookings';

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my`);
  }

  getById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  create(booking: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  updateStatus(id: number, status: 'pending' | 'accepted' | 'refused' | 'completed' | 'cancelled'): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/status`, { status });
  }

  cancel(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // For hosts - get bookings for their stations
  getStationBookings(stationId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/station/${stationId}`);
  }
}
