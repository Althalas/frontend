import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Station {
  id: number;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  powerKva: number;
  isActive: boolean;
  instructions?: string;
  isOnStand?: boolean;
  location?: {
    id: number;
    address: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  pricing?: Array<{
    id: number;
    hourlyRate: number;
    validFrom: string;
    validTo: string | null;
  }>;
}

@Injectable({ providedIn: 'root' })
export class StationsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/stations';

  getAll(page = 1, limit = 10): Observable<{ data: Station[]; meta: any }> {
    return this.http.get<{ data: Station[]; meta: any }>(this.apiUrl, {
      params: { page, limit },
    });
  }

  search(filters: any): Observable<Station[]> {
    let params = new HttpParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key]);
      }
    });
    return this.http.get<Station[]>(`${this.apiUrl}/search`, { params });
  }

  getById(id: number): Observable<Station> {
    return this.http.get<Station>(`${this.apiUrl}/${id}`);
  }

  create(station: Partial<Station>): Observable<Station> {
    return this.http.post<Station>(this.apiUrl, station);
  }

  update(id: number, station: Partial<Station>): Observable<Station> {
    return this.http.patch<Station>(`${this.apiUrl}/${id}`, station);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.apiUrl}/my`);
  }
}

// Helper functions to get station properties
export function getStationAddress(station: Station): string {
  return station.location?.address || station.city || '';
}

export function getStationPower(station: Station): number {
  return station.powerKva;
}

export function getStationPrice(station: Station): number {
  return station.pricing?.[0]?.hourlyRate || 0;
}
