import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import * as maplibregl from 'maplibre-gl';
import { StationsService, Station, getStationAddress, getStationPower, getStationPrice } from '../../../../core/services/stations.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss']
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  map: maplibregl.Map | undefined;
  stations: Station[] = [];
  isLoading = true;
  markers: maplibregl.Marker[] = [];

  constructor(
    private stationsService: StationsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStations();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json', // Free MapLibre style
      center: [2.3522, 48.8566], // Paris coordinates
      zoom: 12
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
    this.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-right'
    );

    // Wait for map to load before adding markers
    this.map.on('load', () => {
      if (this.stations.length > 0) {
        this.addStationMarkers();
      }
    });
  }

  loadStations(): void {
    this.isLoading = true;
    this.stationsService.getAll().subscribe({
      next: (response) => {
        this.stations = response.data.filter((s: Station) => s.isActive);
        this.isLoading = false;
        if (this.map?.loaded()) {
          this.addStationMarkers();
        }
      },
      error: (error) => {
        console.error('Error loading stations:', error);
        this.isLoading = false;
      }
    });
  }

  addStationMarkers(): void {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Add markers for each station
    this.stations.forEach(station => {
      if (station.latitude && station.longitude) {
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="#1976d2"/>
            <circle cx="15" cy="15" r="6" fill="white"/>
            <text x="15" y="18" text-anchor="middle" fill="#1976d2" font-size="10" font-weight="bold">⚡</text>
          </svg>
        `;
        el.style.cursor = 'pointer';

        // Create popup content
        const popupContent = `
          <div style="padding: 8px; min-width: 200px;">
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

        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([station.longitude, station.latitude])
          .setPopup(popup)
          .addTo(this.map!);

        this.markers.push(marker);
      }
    });

    // Fit map to show all markers
    if (this.stations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      this.stations.forEach(station => {
        if (station.latitude && station.longitude) {
          bounds.extend([station.longitude, station.latitude]);
        }
      });
      this.map.fitBounds(bounds, { padding: 50 });
    }

    // Add global navigation function for popup buttons
    (window as any).navigateToStation = (id: number) => {
      this.router.navigate(['/stations', id]);
    };
  }
}
