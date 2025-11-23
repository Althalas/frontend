import { Component, OnInit, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { StationsService, Station, getStationAddress, getStationPrice, getStationPower } from '@core/services/stations.service';

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
                    <p>{{ getAddress(station) }}</p>
                    <span class="station-price"
                      >{{ getPrice(station) | number: '1.2-2' }} €/h</span
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
          <div id="stations-map" class="map"></div>
          @if (isLoading) {
          <div class="map-loading">
            <mat-spinner></mat-spinner>
            <p>Chargement de la carte...</p>
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

      .map {
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      .map-loading {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.9);
        z-index: 1000;
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
export class StationsMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private stationsService = inject(StationsService);
  private router = inject(Router);

  map: L.Map | undefined;
  markers: L.Marker[] = [];
  searchAddress = '';
  searchRadius = 10;
  allStations: Station[] = [];
  nearbyStations: Station[] = [];
  selectedStation: Station | null = null;
  userLocation: { lat: number; lng: number } | null = null;
  isLoading = false;

  // Custom icon for stations
  private stationIcon = L.icon({
    iconUrl: 'assets/marker-icon.png',
    iconRetinaUrl: 'assets/marker-icon-2x.png',
    shadowUrl: 'assets/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Fallback icon if assets are missing
  private defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngOnInit(): void {
    this.loadAllStations();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  initializeMap(): void {
    const container = document.getElementById('stations-map');
    if (!container) {
      console.error('Map container not found');
      return;
    }

    this.map = L.map('stations-map').setView([48.8566, 2.3522], 6); // Paris coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add click handler for map
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      const popupContent = `
        <div style="padding: 12px; min-width: 200px; text-align: center;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1976d2;">Nouvelle borne</h3>
          <p style="margin: 4px 0 12px 0; font-size: 14px;">Ajouter une borne à cet emplacement ?</p>
          <button
            onclick="window.navigateToCreateStation(${lat}, ${lng})"
            style="padding: 8px 16px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%; font-weight: 500;"
          >
            Ajouter une borne ici
          </button>
        </div>
      `;

      L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(this.map!);
    });

    // Add global navigation function
    (window as any).navigateToCreateStation = (lat: number, lng: number) => {
      this.router.navigate(['/stations/new'], {
        queryParams: { lat, lng }
      });
    };

    if (this.allStations.length > 0) {
      this.addStationMarkers(this.allStations, false);
    }
  }

  loadAllStations(): void {
    this.isLoading = true;
    this.stationsService.getAll().subscribe({
      next: (response) => {
        this.allStations = response.data.filter((s: Station) => s.isActive);
        this.isLoading = false;
        if (this.map) {
          this.addStationMarkers(this.allStations, false);
        }
      },
      error: (error) => {
        console.error('Error loading stations:', error);
        this.isLoading = false;
      }
    });
  }

  addStationMarkers(stations: Station[], autoFit: boolean = true): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    const bounds = L.latLngBounds([]);

    // Add markers for each station
    stations.forEach(station => {
      if (station.latitude && station.longitude) {
        const popupContent = `
          <div style="padding: 12px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1976d2;">${station.name}</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Adresse:</strong> ${getStationAddress(station)}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Puissance:</strong> ${getStationPower(station)} kVA</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Prix:</strong> ${getStationPrice(station)}€/h</p>
            <button
              onclick="window.navigateToStation(${station.id})"
              style="margin-top: 8px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;"
            >
              Voir détails
            </button>
          </div>
        `;

        const marker = L.marker([station.latitude, station.longitude], { icon: this.defaultIcon })
          .bindPopup(popupContent)
          .addTo(this.map!);

        this.markers.push(marker);
        bounds.extend([station.latitude, station.longitude]);
      }
    });

    // Fit map to show all markers only if autoFit is true and we have markers
    if (autoFit && stations.length > 0 && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    (window as any).navigateToStation = (id: number) => {
      this.router.navigate(['/stations', id]);
    };
  }

  getCurrentLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.error('Géolocalisation non supportée');
        reject('Géolocalisation non supportée');
        return;
      }

      this.isLoading = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Center map on user location if map is loaded
          if (this.map) {
            this.map.setView([this.userLocation.lat, this.userLocation.lng], 13);

            // Add a marker for user location
            L.circleMarker([this.userLocation.lat, this.userLocation.lng], {
              radius: 8,
              fillColor: '#3388ff',
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(this.map).bindPopup('Votre position');
          }
          this.isLoading = false;
          resolve();
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          this.isLoading = false;
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  async searchNearby(): Promise<void> {
    if (!this.userLocation) {
      try {
        await this.getCurrentLocation();
      } catch (error) {
        console.error('Impossible de récupérer la position:', error);
        return;
      }
    }

    if (this.userLocation) {
      this.performSearch();
    }
  }

  performSearch(): void {
    if (!this.userLocation) return;

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

          // Update markers to show only nearby stations and auto-fit
          if (this.map) {
            this.addStationMarkers(this.nearbyStations, true);
          }
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isLoading = false;
        },
      });
  }

  selectStation(station: Station): void {
    this.selectedStation = station;

    // Fly to station location on map
    if (this.map && station.latitude && station.longitude) {
      this.map.setView([station.latitude, station.longitude], 15);

      // Find and open the marker popup
      const marker = this.markers.find(m => {
        const latLng = m.getLatLng();
        return latLng.lat === station.latitude && latLng.lng === station.longitude;
      });

      if (marker) {
        marker.openPopup();
      }
    }
  }

  getAddress(station: Station): string {
    return getStationAddress(station);
  }

  getPrice(station: Station): number {
    return getStationPrice(station);
  }
}
