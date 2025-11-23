import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/auth.service';
import { BookingsService, Booking } from '@core/services/bookings.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>Bonjour, {{ userName }} !</h1>
        <p>Bienvenue sur votre tableau de bord Electricity Business</p>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>calendar_today</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ upcomingBookingsCount }}</span>
              <span class="stat-label">Réservations à venir</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>bolt</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ totalEnergy | number: '1.0-0' }}</span>
              <span class="stat-label">kWh chargés</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>savings</mat-icon>
            <div class="stat-info">
              <span class="stat-value">{{ totalSpent | number: '1.2-2' }} €</span>
              <span class="stat-label">Dépensés</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h2>Actions rapides</h2>
        <div class="actions-grid">
          <mat-card class="action-card" routerLink="/stations">
            <mat-card-content>
              <mat-icon>search</mat-icon>
              <span>Trouver une borne</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/bookings">
            <mat-card-content>
              <mat-icon>event</mat-icon>
              <span>Mes réservations</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/dashboard/profile">
            <mat-card-content>
              <mat-icon>person</mat-icon>
              <span>Mon profil</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/stations/new">
            <mat-card-content>
              <mat-icon>add_circle</mat-icon>
              <span>Ajouter une borne</span>
            </mat-card-content>
          </mat-card>

          <mat-card class="action-card" routerLink="/dashboard/my-stations">
            <mat-card-content>
              <mat-icon>ev_station</mat-icon>
              <span>Mes bornes</span>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      @if (recentBookings.length > 0) {
      <div class="recent-bookings">
        <h2>Réservations récentes</h2>
        <div class="bookings-list">
          @for (booking of recentBookings; track booking.id) {
          <mat-card class="booking-item" [routerLink]="['/bookings', booking.id]">
            <mat-card-content>
              <div class="booking-info">
                <strong>{{ booking.station?.name || 'Borne' }}</strong>
                <p>{{ booking.startTime | date: 'dd/MM/yyyy HH:mm' }}</p>
              </div>
              <div class="booking-price">
                {{ booking.totalPrice | number: '1.2-2' }} €
              </div>
              <mat-icon>chevron_right</mat-icon>
            </mat-card-content>
          </mat-card>
          }
        </div>
        <button mat-button color="primary" routerLink="/bookings">
          Voir toutes les réservations
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .welcome-section {
        margin-bottom: 32px;
      }

      .welcome-section h1 {
        margin: 0 0 8px;
        font-size: 32px;
      }

      .welcome-section p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }

      .stat-card mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
      }

      .stat-card mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: var(--primary-color);
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 600;
      }

      .stat-label {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
      }

      .quick-actions h2,
      .recent-bookings h2 {
        margin: 0 0 16px;
        font-size: 20px;
      }

      .actions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
      }

      .action-card {
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .action-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .action-card mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        text-align: center;
      }

      .action-card mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        color: var(--accent-color);
      }

      .bookings-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .booking-item {
        cursor: pointer;
        transition: box-shadow 0.2s;
      }

      .booking-item:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .booking-item mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
      }

      .booking-info {
        flex: 1;
      }

      .booking-info strong {
        display: block;
        margin-bottom: 4px;
      }

      .booking-info p {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .booking-price {
        font-weight: 600;
        color: #4caf50;
      }
    `,
  ],
})
export class DashboardHomeComponent implements OnInit {
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);

  userName = '';
  upcomingBookingsCount = 0;
  totalEnergy = 0;
  totalSpent = 0;
  recentBookings: Booking[] = [];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.firstName || user.email;
    }

    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingsService.getMyBookings().subscribe({
      next: (bookings) => {
        const now = new Date();

        // Calculate stats
        this.upcomingBookingsCount = bookings.filter(
          (b) => new Date(b.endTime) > now && b.status !== 'cancelled'
        ).length;

        const completedBookings = bookings.filter(
          (b) => b.status === 'completed'
        );

        // Total energy not available, estimate from totalPrice
        this.totalEnergy = 0; // Not tracked

        this.totalSpent = completedBookings.reduce(
          (sum, b) => sum + b.totalPrice,
          0
        );

        // Get recent bookings
        this.recentBookings = bookings
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);
      },
    });
  }
}
