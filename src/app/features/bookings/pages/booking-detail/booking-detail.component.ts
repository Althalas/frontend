import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BookingsService, Booking } from '@core/services/bookings.service';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    @if (isLoading) {
    <div class="loading-container">
      <mat-spinner></mat-spinner>
    </div>
    } @else if (booking) {
    <div class="booking-detail-container">
      <div class="page-header">
        <button mat-icon-button routerLink="/bookings">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Réservation #{{ booking.id.slice(0, 8) }}</h1>
        <mat-chip [ngClass]="'status-' + booking.status.toLowerCase()">
          {{ getStatusLabel(booking.status) }}
        </mat-chip>
      </div>

      <div class="booking-content">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>ev_station</mat-icon>
            <mat-card-title>{{ booking.station?.name || 'Borne' }}</mat-card-title>
            <mat-card-subtitle>{{ booking.station?.address }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <strong>Date</strong>
                  <p>{{ booking.startTime | date: 'EEEE d MMMM yyyy' }}</p>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>schedule</mat-icon>
                <div>
                  <strong>Horaire</strong>
                  <p>
                    {{ booking.startTime | date: 'HH:mm' }} -
                    {{ booking.endTime | date: 'HH:mm' }}
                  </p>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>bolt</mat-icon>
                <div>
                  <strong>Énergie demandée</strong>
                  <p>{{ booking.energyRequested }} kWh</p>
                </div>
              </div>

              <div class="info-item">
                <mat-icon>payments</mat-icon>
                <div>
                  <strong>Montant total</strong>
                  <p class="price">{{ booking.totalPrice | number: '1.2-2' }} €</p>
                </div>
              </div>
            </div>
          </mat-card-content>

          @if (booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
          <mat-card-actions>
            <button
              mat-raised-button
              color="warn"
              (click)="cancelBooking()"
              [disabled]="isProcessing"
            >
              <mat-icon>cancel</mat-icon>
              Annuler la réservation
            </button>
          </mat-card-actions>
          }
        </mat-card>

        <mat-card class="timeline-card">
          <mat-card-header>
            <mat-card-title>Historique</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="timeline">
              <div class="timeline-item completed">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <strong>Réservation créée</strong>
                  <p>{{ booking.createdAt | date: 'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>

              @if (booking.status !== 'PENDING' && booking.status !== 'CANCELLED')
              {
              <div class="timeline-item completed">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <strong>Paiement confirmé</strong>
                  <p>Réservation validée</p>
                </div>
              </div>
              } @if (booking.status === 'IN_PROGRESS') {
              <div class="timeline-item active">
                <mat-icon>electric_car</mat-icon>
                <div>
                  <strong>Charge en cours</strong>
                  <p>Session active</p>
                </div>
              </div>
              } @if (booking.status === 'COMPLETED') {
              <div class="timeline-item completed">
                <mat-icon>check_circle</mat-icon>
                <div>
                  <strong>Charge terminée</strong>
                  <p>Session complétée avec succès</p>
                </div>
              </div>
              } @if (booking.status === 'CANCELLED') {
              <div class="timeline-item cancelled">
                <mat-icon>cancel</mat-icon>
                <div>
                  <strong>Réservation annulée</strong>
                  <p>La réservation a été annulée</p>
                </div>
              </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        @if (booking.status === 'COMPLETED') {
        <mat-card class="review-card">
          <mat-card-header>
            <mat-card-title>Votre avis</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Partagez votre expérience pour aider les autres utilisateurs.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent">
              <mat-icon>rate_review</mat-icon>
              Laisser un avis
            </button>
          </mat-card-actions>
        </mat-card>
        }
      </div>
    </div>
    }
  `,
  styles: [
    `
      .loading-container {
        display: flex;
        justify-content: center;
        padding: 60px;
      }

      .booking-detail-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
      }

      .page-header h1 {
        margin: 0;
        flex: 1;
      }

      .booking-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .info-card mat-card-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
        margin-top: 16px;
      }

      .info-item {
        display: flex;
        gap: 12px;
      }

      .info-item mat-icon {
        color: #667eea;
      }

      .info-item strong {
        display: block;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        text-transform: uppercase;
        margin-bottom: 4px;
      }

      .info-item p {
        margin: 0;
        font-size: 16px;
      }

      .info-item .price {
        color: #4caf50;
        font-weight: 600;
        font-size: 20px;
      }

      .timeline {
        padding: 16px 0;
      }

      .timeline-item {
        display: flex;
        gap: 16px;
        padding: 16px 0;
        border-left: 2px solid #e0e0e0;
        margin-left: 12px;
        padding-left: 24px;
        position: relative;
      }

      .timeline-item mat-icon {
        position: absolute;
        left: -13px;
        background: white;
      }

      .timeline-item.completed mat-icon {
        color: #4caf50;
      }

      .timeline-item.active mat-icon {
        color: #2196f3;
      }

      .timeline-item.cancelled mat-icon {
        color: #f44336;
      }

      .timeline-item strong {
        display: block;
        margin-bottom: 4px;
      }

      .timeline-item p {
        margin: 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .status-pending {
        background-color: #fff3e0 !important;
        color: #e65100 !important;
      }

      .status-confirmed {
        background-color: #e3f2fd !important;
        color: #1565c0 !important;
      }

      .status-in_progress {
        background-color: #e8f5e9 !important;
        color: #2e7d32 !important;
      }

      .status-completed {
        background-color: #f5f5f5 !important;
        color: #616161 !important;
      }

      .status-cancelled {
        background-color: #ffebee !important;
        color: #c62828 !important;
      }

      @media (max-width: 600px) {
        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingsService = inject(BookingsService);
  private snackBar = inject(MatSnackBar);

  booking: Booking | null = null;
  isLoading = true;
  isProcessing = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBooking(id);
    }
  }

  loadBooking(id: string): void {
    this.bookingsService.getById(id).subscribe({
      next: (booking) => {
        this.booking = booking;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/bookings']);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  }

  cancelBooking(): void {
    if (!this.booking) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.isProcessing = true;
      this.bookingsService.cancel(this.booking.id).subscribe({
        next: (booking) => {
          this.booking = booking;
          this.isProcessing = false;
          this.snackBar.open('Réservation annulée', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          this.isProcessing = false;
          const message = err.error?.message || "Erreur lors de l'annulation";
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
        },
      });
    }
  }
}
