import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { StationsService, Station } from '@core/services/stations.service';

@Component({
  selector: 'app-stations-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="map-container">
      <div class="map-header">
        <button mat-icon-button routerLink="/stations">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Carte des bornes</h1>
      </div>

      <div class="map-content">
        <div class="search-panel">
          <mat-card>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Rechercher une adresse</mat-label>
                <input matInput [(ngModel)]="searchAddress" />
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>

              <div class="radius-control">
                <label>Rayon de recherche: {{ searchRadius }} km</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  [(ngModel)]="searchRadius"
                />
              </div>

              <button
                mat-raised-button
                color="primary"
                class="full-width"
                (click)="searchNearby()"
              >
                <mat-icon>my_location</mat-icon>
                Utiliser ma position
              </button>
            </mat-card-content>
          </mat-card>

          @if (nearbyStations.length > 0) {
          <mat-card class="results-card">
            <mat-card-header>
              <mat-card-title>{{ nearbyStations.length }} bornes trouvées</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="station-list">
                @for (station of nearbyStations; track station.id) {
                <div
                  class="station-item"
                  [class.selected]="selectedStation?.id === station.id"
                  (click)="selectStation(station)"
                >
                  <div class="station-item-info">
                    <strong>{{ station.name }}</strong>
                    <p>{{ station.address }}</p>
                    <span class="station-price"
                      >{{ station.pricePerKwh | number: '1.2-2' }} €/kWh</span
                    >
                  </div>
                  <button
                    mat-icon-button
                    [routerLink]="['/stations', station.id]"
                  >
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
          }
        </div>

        <div class="map-view">
          @if (isLoading) {
          <div class="map-loading">
            <mat-spinner></mat-spinner>
            <p>Chargement de la carte...</p>
          </div>
          } @else {
          <div class="map-placeholder">
            <mat-icon>map</mat-icon>
            <h2>Carte Google Maps</h2>
            <p>
              La carte interactive sera affichée ici une fois la clé API Google
              Maps configurée.
            </p>
            @if (userLocation) {
            <p class="location-info">
              Position actuelle: {{ userLocation.lat | number: '1.4-4' }},
              {{ userLocation.lng | number: '1.4-4' }}
            </p>
            }
          </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .map-container {
        height: calc(100vh - 64px);
        display: flex;
        flex-direction: column;
      }

      .map-header {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .map-header h1 {
        margin: 0;
        font-size: 24px;
      }

      .map-content {
        flex: 1;
        display: grid;
        grid-template-columns: 350px 1fr;
        overflow: hidden;
      }

      .search-panel {
        padding: 16px;
        overflow-y: auto;
        background: #f5f5f5;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .full-width {
        width: 100%;
      }

      .radius-control {
        margin-bottom: 16px;
      }

      .radius-control label {
        display: block;
        margin-bottom: 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .radius-control input {
        width: 100%;
      }

      .results-card {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .station-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .station-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .station-item:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .station-item.selected {
        background: rgba(102, 126, 234, 0.1);
      }

      .station-item-info {
        flex: 1;
      }

      .station-item-info strong {
        display: block;
        font-size: 14px;
      }

      .station-item-info p {
        margin: 4px 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .station-price {
        font-size: 12px;
        color: #4caf50;
        font-weight: 500;
      }

      .map-view {
        position: relative;
      }

      .map-loading,
      .map-placeholder {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #e0e0e0;
      }

      .map-placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.3);
      }

      .map-placeholder h2 {
        margin: 16px 0 8px;
        color: rgba(0, 0, 0, 0.6);
      }

      .map-placeholder p {
        color: rgba(0, 0, 0, 0.4);
        text-align: center;
        max-width: 300px;
      }

      .location-info {
        font-family: monospace;
        background: rgba(0, 0, 0, 0.1);
        padding: 8px 16px;
        border-radius: 4px;
      }

      @media (max-width: 900px) {
        .map-content {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }

        .search-panel {
          max-height: 300px;
        }
      }
    `,
  ],
})
export class StationsMapComponent implements OnInit {
  private stationsService = inject(StationsService);

  searchAddress = '';
  searchRadius = 10;
  nearbyStations: Station[] = [];
  selectedStation: Station | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.getCurrentLocation();
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        }
      );
    }
  }

  searchNearby(): void {
    if (!this.userLocation) {
      this.getCurrentLocation();
      return;
    }

    this.isLoading = true;
    this.stationsService
      .search({
        lat: this.userLocation.lat,
        lng: this.userLocation.lng,
        radius: this.searchRadius,
      })
      .subscribe({
        next: (stations) => {
          this.nearbyStations = stations;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  selectStation(station: Station): void {
    this.selectedStation = station;
  }
}
