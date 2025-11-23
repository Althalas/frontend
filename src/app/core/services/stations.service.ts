import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface Station {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  power: number;
  connector: string;
  pricePerKwh: number;
  photos: string[];
  avgRating?: number;
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

  getById(id: string): Observable<Station> {
    return this.http.get<Station>(`${this.apiUrl}/${id}`);
  }

  create(station: Partial<Station>): Observable<Station> {
    return this.http.post<Station>(this.apiUrl, station);
  }

  update(id: string, station: Partial<Station>): Observable<Station> {
    return this.http.patch<Station>(`${this.apiUrl}/${id}`, station);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyStations(): Observable<Station[]> {
    return this.http.get<Station[]>(`${this.apiUrl}/my`);
  }
}
