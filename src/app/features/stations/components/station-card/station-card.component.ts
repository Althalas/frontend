import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Station, getStationAddress, getStationPower, getStationPrice } from '@core/services/stations.service';

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
      <div class="station-image-placeholder">
        <mat-icon>ev_station</mat-icon>
      </div>

      <mat-card-content>
        <h3 class="station-name">{{ station.name }}</h3>
        <p class="station-address">
          <mat-icon>location_on</mat-icon>
          {{ getAddress() }}
        </p>

        <div class="station-specs">
          <mat-chip-set>
            <mat-chip>
              <mat-icon>power</mat-icon>
              {{ getPower() | number: '1.1-1' }} kVA
            </mat-chip>
          </mat-chip-set>
        </div>

        <div class="station-footer">
          <div class="price">
            <span class="price-value">{{ getPrice() | number: '1.2-2' }} €</span>
            <span class="price-unit">/h</span>
          </div>
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
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--eco-energy) 100%);
        position: relative;
        overflow: hidden;
      }

      .station-image-placeholder::before {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        animation: pulse 3s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }

      .station-image-placeholder mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: white;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        z-index: 1;
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

  getAddress(): string {
    return getStationAddress(this.station);
  }

  getPower(): number {
    return getStationPower(this.station);
  }

  getPrice(): number {
    return getStationPrice(this.station);
  }
}
