import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { BookingsService, Booking } from '@core/services/bookings.service';
import { getStationAddress } from '@core/services/stations.service';

@Component({
  selector: 'app-bookings-list',
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
  ],
  template: `
    <div class="bookings-container">
      <div class="page-header">
        <h1>Mes réservations</h1>
      </div>

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)">
        <mat-tab label="À venir">
          <ng-template matTabContent>
            @if (isLoading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
            } @else if (upcomingBookings.length === 0) {
            <div class="empty-state">
              <mat-icon>event_busy</mat-icon>
              <h2>Aucune réservation à venir</h2>
              <p>Recherchez une borne et faites votre première réservation !</p>
              <button mat-raised-button color="primary" routerLink="/stations">
                Trouver une borne
              </button>
            </div>
            } @else {
            <div class="bookings-list">
              @for (booking of upcomingBookings; track booking.id) {
              <mat-card class="booking-card">
                <mat-card-content>
                  <div class="booking-info">
                    <div class="booking-station">
                      <h3>{{ booking.station?.name || 'Borne' }}</h3>
                      <p>{{ booking.station ? getStationAddressHelper(booking.station) : '' }}</p>
                    </div>
                    <div class="booking-datetime">
                      <div class="date">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ booking.startTime | date: 'dd/MM/yyyy' }}</span>
                      </div>
                      <div class="time">
                        <mat-icon>schedule</mat-icon>
                        <span>
                          {{ booking.startTime | date: 'HH:mm' }} -
                          {{ booking.endTime | date: 'HH:mm' }}
                        </span>
                      </div>
                    </div>
                    <div class="booking-status">
                      <mat-chip [ngClass]="'status-' + booking.status.toLowerCase()">
                        {{ getStatusLabel(booking.status) }}
                      </mat-chip>
                    </div>
                    <div class="booking-price">
                      <strong>{{ booking.totalPrice | number: '1.2-2' }} €</strong>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button [routerLink]="['/bookings', booking.id]">
                    Détails
                  </button>
                  @if (booking.status === 'pending' || booking.status === 'accepted') {
                  <button mat-button color="warn" (click)="cancelBooking(booking.id)">
                    Annuler
                  </button>
                  }
                </mat-card-actions>
              </mat-card>
              }
            </div>
            }
          </ng-template>
        </mat-tab>

        <mat-tab label="Passées">
          <ng-template matTabContent>
            @if (isLoading) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
            } @else if (pastBookings.length === 0) {
            <div class="empty-state">
              <mat-icon>history</mat-icon>
              <h2>Aucune réservation passée</h2>
            </div>
            } @else {
            <div class="bookings-list">
              @for (booking of pastBookings; track booking.id) {
              <mat-card class="booking-card past">
                <mat-card-content>
                  <div class="booking-info">
                    <div class="booking-station">
                      <h3>{{ booking.station?.name || 'Borne' }}</h3>
                      <p>{{ booking.station ? getStationAddressHelper(booking.station) : '' }}</p>
                    </div>
                    <div class="booking-datetime">
                      <div class="date">
                        <mat-icon>calendar_today</mat-icon>
                        <span>{{ booking.startTime | date: 'dd/MM/yyyy' }}</span>
                      </div>
                    </div>
                    <div class="booking-status">
                      <mat-chip [ngClass]="'status-' + booking.status.toLowerCase()">
                        {{ getStatusLabel(booking.status) }}
                      </mat-chip>
                    </div>
                    <div class="booking-price">
                      <strong>{{ booking.totalPrice | number: '1.2-2' }} €</strong>
                    </div>
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button [routerLink]="['/bookings', booking.id]">
                    Détails
                  </button>
                  @if (booking.status === 'completed') {
                  <button mat-raised-button color="primary" (click)="downloadReceipt(booking.id)">
                    <mat-icon>download</mat-icon>
                    Télécharger le reçu
                  </button>
                  <button mat-button color="accent">
                    Laisser un avis
                  </button>
                  }
                </mat-card-actions>
              </mat-card>
              }
            </div>
            }
          </ng-template>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [
    `
      .bookings-container {
        padding: 20px;
        max-width: 900px;
        margin: 0 auto;
      }

      .page-header h1 {
        margin: 0 0 20px;
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
      }

      .bookings-list {
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .booking-card {
        transition: box-shadow 0.2s;
      }

      .booking-card:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .booking-card.past {
        opacity: 0.8;
      }

      .booking-info {
        display: grid;
        grid-template-columns: 1fr auto auto auto;
        gap: 16px;
        align-items: center;
      }

      .booking-station h3 {
        margin: 0 0 4px;
        font-size: 16px;
      }

      .booking-station p {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .booking-datetime {
        text-align: right;
      }

      .booking-datetime .date,
      .booking-datetime .time {
        display: flex;
        align-items: center;
        gap: 4px;
        justify-content: flex-end;
        font-size: 14px;
      }

      .booking-datetime mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .booking-price {
        text-align: right;
        font-size: 18px;
        color: #4caf50;
      }

      .status-pending {
        background-color: #fff3e0 !important;
        color: #e65100 !important;
      }

      .status-accepted {
        background-color: #e3f2fd !important;
        color: #1565c0 !important;
      }

      .status-refused {
        background-color: #ffebee !important;
        color: #c62828 !important;
      }

      .status-completed {
        background-color: #f5f5f5 !important;
        color: #616161 !important;
      }

      .status-cancelled {
        background-color: #ffcdd2 !important;
        color: #b71c1c !important;
      }

      mat-card-actions {
        display: flex;
        justify-content: flex-end;
      }

      @media (max-width: 600px) {
        .booking-info {
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .booking-datetime,
        .booking-price {
          text-align: left;
        }
      }
    `,
  ],
})
export class BookingsListComponent implements OnInit {
  private bookingsService = inject(BookingsService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  upcomingBookings: Booking[] = [];
  pastBookings: Booking[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingsService.getMyBookings().subscribe({
      next: (bookings) => {
        const now = new Date();
        this.upcomingBookings = bookings.filter(
          (b) => new Date(b.endTime) > now && b.status !== 'cancelled' && b.status !== 'refused'
        );
        this.pastBookings = bookings.filter(
          (b) => new Date(b.endTime) <= now || b.status === 'cancelled' || b.status === 'refused'
        );
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onTabChange(index: number): void {
    // Can add specific loading logic per tab if needed
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      refused: 'Refusée',
      completed: 'Terminée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  }

  getStationAddressHelper(station: any): string {
    return getStationAddress(station);
  }

  cancelBooking(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.bookingsService.cancel(id).subscribe({
        next: () => {
          this.loadBookings();
        },
      });
    }
  }

  downloadReceipt(id: number): void {
    window.open(`${this.apiUrl}/bookings/${id}/receipt`, '_blank');
  }
}
