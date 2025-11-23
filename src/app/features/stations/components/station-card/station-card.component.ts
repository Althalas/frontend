import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Station } from '@core/services/stations.service';

@Component({
  selector: 'app-station-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
  ],
  template: `
    <mat-card class="station-card">
      @if (station.photos && station.photos.length > 0) {
      <img
        mat-card-image
        [src]="station.photos[0]"
        [alt]="station.name"
        class="station-image"
      />
      } @else {
      <div class="station-image-placeholder">
        <mat-icon>ev_station</mat-icon>
      </div>
      }

      <mat-card-content>
        <h3 class="station-name">{{ station.name }}</h3>
        <p class="station-address">
          <mat-icon>location_on</mat-icon>
          {{ station.address }}
        </p>

        <div class="station-specs">
          <mat-chip-set>
            <mat-chip>
              <mat-icon>power</mat-icon>
              {{ station.power }} kW
            </mat-chip>
            <mat-chip>
              <mat-icon>electrical_services</mat-icon>
              {{ station.connector }}
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="station-footer">
          <div class="price">
            <span class="price-value">{{ station.pricePerKwh | number: '1.2-2' }} €</span>
            <span class="price-unit">/kWh</span>
          </div>
          @if (station.avgRating) {
          <div class="rating">
            <mat-icon>star</mat-icon>
            <span>{{ station.avgRating | number: '1.1-1' }}</span>
          </div>
          }
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-button color="primary" [routerLink]="['/stations', station.id]">
          Voir détails
        </button>
        <button mat-raised-button color="accent" [routerLink]="['/bookings/new', station.id]">
          Réserver
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .station-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .station-image {
        height: 180px;
        object-fit: cover;
      }

      .station-image-placeholder {
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .station-image-placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: white;
      }

      mat-card-content {
        flex: 1;
        padding: 16px;
      }

      .station-name {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 500;
      }

      .station-address {
        display: flex;
        align-items: center;
        gap: 4px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
        margin: 0 0 12px;
      }

      .station-address mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .station-specs {
        margin-bottom: 12px;
      }

      .station-specs mat-chip {
        font-size: 12px;
      }

      .station-specs mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        margin-right: 4px;
      }

      .station-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .price {
        color: #4caf50;
      }

      .price-value {
        font-size: 20px;
        font-weight: 600;
      }

      .price-unit {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .rating mat-icon {
        color: #ffc107;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      mat-card-actions {
        padding: 8px 16px 16px;
        display: flex;
        justify-content: space-between;
      }
    `,
  ],
})
export class StationCardComponent {
  @Input({ required: true }) station!: Station;
}
