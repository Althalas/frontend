import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StationsService, Station } from '@core/services/stations.service';

@Component({
  selector: 'app-my-stations',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="my-stations-container">
      <div class="page-header">
        <h1>Mes bornes de recharge</h1>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Ajouter une borne
        </button>
      </div>

      @if (isLoading) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
      } @else if (stations.length === 0) {
      <mat-card class="empty-state">
        <mat-card-content>
          <mat-icon>ev_station</mat-icon>
          <h2>Aucune borne enregistrée</h2>
          <p>
            Commencez à gagner de l'argent en partageant votre borne de recharge
            avec d'autres utilisateurs.
          </p>
          <button mat-raised-button color="primary">
            <mat-icon>add</mat-icon>
            Ajouter ma première borne
          </button>
        </mat-card-content>
      </mat-card>
      } @else {
      <div class="stations-list">
        @for (station of stations; track station.id) {
        <mat-card class="station-card">
          <mat-card-content>
            <div class="station-main">
              @if (station.photos && station.photos.length > 0) {
              <img
                [src]="station.photos[0]"
                [alt]="station.name"
                class="station-image"
              />
              } @else {
              <div class="station-image-placeholder">
                <mat-icon>ev_station</mat-icon>
              </div>
              }

              <div class="station-info">
                <h3>{{ station.name }}</h3>
                <p class="address">{{ station.address }}</p>
                <div class="specs">
                  <mat-chip>{{ station.power }} kW</mat-chip>
                  <mat-chip>{{ station.connector }}</mat-chip>
                </div>
                <p class="price">
                  {{ station.pricePerKwh | number: '1.2-2' }} €/kWh
                </p>
              </div>
            </div>

            <div class="station-actions">
              <button mat-icon-button [matMenuTriggerFor]="menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item [routerLink]="['/stations', station.id]">
                  <mat-icon>visibility</mat-icon>
                  <span>Voir</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>edit</mat-icon>
                  <span>Modifier</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>calendar_today</mat-icon>
                  <span>Disponibilités</span>
                </button>
                <button mat-menu-item>
                  <mat-icon>bar_chart</mat-icon>
                  <span>Statistiques</span>
                </button>
                <button
                  mat-menu-item
                  class="delete-action"
                  (click)="deleteStation(station)"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Supprimer</span>
                </button>
              </mat-menu>
            </div>
          </mat-card-content>

          <mat-card-footer>
            <div class="station-stats">
              <div class="stat">
                <span class="stat-value">{{ getBookingsCount(station) }}</span>
                <span class="stat-label">Réservations</span>
              </div>
              <div class="stat">
                <span class="stat-value"
                  >{{ getRevenue(station) | number: '1.0-0' }} €</span
                >
                <span class="stat-label">Revenus</span>
              </div>
              @if (station.avgRating) {
              <div class="stat">
                <span class="stat-value"
                  >{{ station.avgRating | number: '1.1-1' }}</span
                >
                <span class="stat-label">Note</span>
              </div>
              }
            </div>
          </mat-card-footer>
        </mat-card>
        }
      </div>
      }
    </div>
  `,
  styles: [
    `
      .my-stations-container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 60px;
      }

      .empty-state {
        text-align: center;
        padding: 60px 20px;
      }

      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: rgba(0, 0, 0, 0.3);
      }

      .empty-state h2 {
        margin: 16px 0 8px;
      }

      .empty-state p {
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 24px;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
      }

      .stations-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .station-card mat-card-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px;
      }

      .station-main {
        display: flex;
        gap: 16px;
        flex: 1;
      }

      .station-image {
        width: 120px;
        height: 90px;
        object-fit: cover;
        border-radius: 8px;
      }

      .station-image-placeholder {
        width: 120px;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
      }

      .station-image-placeholder mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: white;
      }

      .station-info h3 {
        margin: 0 0 4px;
        font-size: 18px;
      }

      .station-info .address {
        margin: 0 0 8px;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .specs {
        margin-bottom: 8px;
      }

      .specs mat-chip {
        font-size: 12px;
      }

      .price {
        margin: 0;
        color: #4caf50;
        font-weight: 600;
      }

      mat-card-footer {
        padding: 12px 16px;
        background: #f5f5f5;
      }

      .station-stats {
        display: flex;
        justify-content: space-around;
      }

      .stat {
        text-align: center;
      }

      .stat-value {
        display: block;
        font-size: 18px;
        font-weight: 600;
        color: #667eea;
      }

      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .delete-action {
        color: #f44336;
      }

      @media (max-width: 600px) {
        .station-main {
          flex-direction: column;
        }

        .station-image,
        .station-image-placeholder {
          width: 100%;
          height: 150px;
        }
      }
    `,
  ],
})
export class MyStationsComponent implements OnInit {
  private stationsService = inject(StationsService);
  private snackBar = inject(MatSnackBar);

  stations: Station[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.isLoading = true;
    this.stationsService.getMyStations().subscribe({
      next: (stations) => {
        this.stations = stations;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  getBookingsCount(station: Station): number {
    // TODO: Get from API
    return Math.floor(Math.random() * 50);
  }

  getRevenue(station: Station): number {
    // TODO: Get from API
    return Math.floor(Math.random() * 500);
  }

  deleteStation(station: Station): void {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer la borne "${station.name}" ?`)
    ) {
      this.stationsService.delete(station.id).subscribe({
        next: () => {
          this.stations = this.stations.filter((s) => s.id !== station.id);
          this.snackBar.open('Borne supprimée', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          const message = err.error?.message || 'Erreur lors de la suppression';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
        },
      });
    }
  }
}
