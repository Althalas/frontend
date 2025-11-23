import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { StationsService, Station, getStationAddress, getStationPower, getStationPrice } from '@core/services/stations.service';

@Component({
  selector: 'app-station-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    @if (isLoading) {
    <div class="loading-container">
      <mat-spinner></mat-spinner>
      <p>Chargement de la borne...</p>
    </div>
    } @else if (station) {
    <div class="station-detail-container">
      <div class="station-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ station.name }}</h1>
      </div>

      <div class="station-content">
        <div class="station-gallery">
          <div class="no-photo">
            <mat-icon>ev_station</mat-icon>
            <p>Aucune photo disponible</p>
          </div>
        </div>

        <div class="station-info">
          <mat-card>
            <mat-card-content>
              <div class="info-row">
                <mat-icon>location_on</mat-icon>
                <div>
                  <strong>Adresse</strong>
                  <p>{{ getAddress(station) }}</p>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="info-row">
                <mat-icon>power</mat-icon>
                <div>
                  <strong>Puissance</strong>
                  <p>{{ getPower(station) | number: '1.1-1' }} kVA</p>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="info-row price-row">
                <mat-icon>payments</mat-icon>
                <div>
                  <strong>Tarif</strong>
                  <p class="price">{{ getPrice(station) | number: '1.2-2' }} € / h</p>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button
                mat-raised-button
                color="primary"
                class="full-width"
                [routerLink]="['/bookings/new', station.id]"
              >
                <mat-icon>calendar_today</mat-icon>
                Réserver cette borne
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>

      <mat-card class="map-card">
        <mat-card-header>
          <mat-card-title>Localisation</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="map-placeholder">
            <mat-icon>map</mat-icon>
            <p>
              Coordonnées: {{ station.latitude }}, {{ station.longitude }}
            </p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
    }
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 20px;
      }

      .station-detail-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .station-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }

      .station-header h1 {
        margin: 0;
        font-size: 28px;
      }

      .station-content {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 24px;
        margin-bottom: 24px;
      }

      .station-gallery {
        background: #f5f5f5;
        border-radius: 8px;
        overflow: hidden;
      }

      .main-photo {
        width: 100%;
        height: 400px;
        object-fit: cover;
      }

      .photo-thumbnails {
        display: flex;
        gap: 8px;
        padding: 8px;
        overflow-x: auto;
      }

      .photo-thumbnails img {
        width: 80px;
        height: 60px;
        object-fit: cover;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }

      .photo-thumbnails img.active,
      .photo-thumbnails img:hover {
        opacity: 1;
      }

      .no-photo {
        height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .no-photo mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }

      .station-info mat-card {
        height: 100%;
      }

      .info-row {
        display: flex;
        gap: 16px;
        padding: 16px 0;
      }

      .info-row mat-icon {
        color: #667eea;
      }

      .info-row strong {
        display: block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .info-row p {
        margin: 0;
        font-size: 16px;
      }

      .price-row .price {
        color: #4caf50;
        font-weight: 600;
        font-size: 20px;
      }

      mat-card-actions {
        padding: 16px;
      }

      .full-width {
        width: 100%;
      }

      .map-card .map-placeholder {
        height: 300px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border-radius: 8px;
      }

      .map-placeholder mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: rgba(0, 0, 0, 0.3);
      }

      @media (max-width: 900px) {
        .station-content {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stationsService = inject(StationsService);

  station: Station | null = null;
  isLoading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStation(Number(id));
    }
  }

  loadStation(id: number): void {
    this.stationsService.getById(id).subscribe({
      next: (station) => {
        this.station = station;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/stations']);
      },
    });
  }

  getAddress(station: Station): string {
    return getStationAddress(station);
  }

  getPower(station: Station): number {
    return getStationPower(station);
  }

  getPrice(station: Station): number {
    return getStationPrice(station);
  }

  goBack(): void {
    this.router.navigate(['/stations']);
  }
}
