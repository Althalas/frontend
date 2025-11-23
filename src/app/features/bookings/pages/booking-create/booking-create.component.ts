import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { StationsService, Station } from '@core/services/stations.service';
import { BookingsService } from '@core/services/bookings.service';

@Component({
  selector: 'app-booking-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="booking-create-container">
      <div class="page-header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Nouvelle réservation</h1>
      </div>

      @if (isLoadingStation) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
      </div>
      } @else if (station) {
      <div class="booking-content">
        <mat-card class="station-summary">
          <mat-card-header>
            <mat-card-title>{{ station.name }}</mat-card-title>
            <mat-card-subtitle>{{ station.address }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="station-specs">
              <span><mat-icon>power</mat-icon> {{ station.power }} kW</span>
              <span
                ><mat-icon>electrical_services</mat-icon>
                {{ station.connector }}</span
              >
              <span class="price"
                ><mat-icon>payments</mat-icon>
                {{ station.pricePerKwh | number: '1.2-2' }} €/kWh</span
              >
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="booking-form-card">
          <mat-card-header>
            <mat-card-title>Détails de la réservation</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="bookingForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date</mat-label>
                <input
                  matInput
                  [matDatepicker]="picker"
                  formControlName="date"
                  [min]="minDate"
                />
                <mat-datepicker-toggle
                  matIconSuffix
                  [for]="picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                @if (bookingForm.get('date')?.hasError('required')) {
                <mat-error>La date est requise</mat-error>
                }
              </mat-form-field>

              <div class="time-row">
                <mat-form-field appearance="outline">
                  <mat-label>Heure de début</mat-label>
                  <input matInput type="time" formControlName="startTime" />
                  @if (bookingForm.get('startTime')?.hasError('required')) {
                  <mat-error>Requis</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Heure de fin</mat-label>
                  <input matInput type="time" formControlName="endTime" />
                  @if (bookingForm.get('endTime')?.hasError('required')) {
                  <mat-error>Requis</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Énergie souhaitée (kWh)</mat-label>
                <input
                  matInput
                  type="number"
                  formControlName="energyRequested"
                  min="1"
                />
                <mat-hint
                  >Maximum: {{ calculateMaxEnergy() | number: '1.1-1' }}
                  kWh</mat-hint
                >
                @if (bookingForm.get('energyRequested')?.hasError('required')) {
                <mat-error>L'énergie est requise</mat-error>
                } @if (bookingForm.get('energyRequested')?.hasError('min')) {
                <mat-error>Minimum 1 kWh</mat-error>
                }
              </mat-form-field>

              <mat-divider></mat-divider>

              <div class="price-summary">
                <div class="price-row">
                  <span>Durée estimée</span>
                  <span>{{ calculateDuration() }} min</span>
                </div>
                <div class="price-row">
                  <span>Énergie</span>
                  <span
                    >{{ bookingForm.get('energyRequested')?.value || 0 }}
                    kWh</span
                  >
                </div>
                <div class="price-row total">
                  <span>Total estimé</span>
                  <span>{{ calculateTotal() | number: '1.2-2' }} €</span>
                </div>
              </div>

              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="full-width submit-btn"
                [disabled]="bookingForm.invalid || isSubmitting"
              >
                @if (isSubmitting) {
                <mat-spinner diameter="20"></mat-spinner>
                } @else { Confirmer la réservation }
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .booking-create-container {
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
      }

      .loading-container {
        display: flex;
        justify-content: center;
        padding: 60px;
      }

      .booking-content {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .station-summary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .station-summary mat-card-title,
      .station-summary mat-card-subtitle {
        color: white;
      }

      .station-specs {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
      }

      .station-specs span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .station-specs .price {
        color: #c5e1a5;
        font-weight: 500;
      }

      .station-specs mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .full-width {
        width: 100%;
      }

      .time-row {
        display: flex;
        gap: 16px;
      }

      .time-row mat-form-field {
        flex: 1;
      }

      mat-divider {
        margin: 20px 0;
      }

      .price-summary {
        margin-bottom: 24px;
      }

      .price-row {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        font-size: 14px;
        color: rgba(0, 0, 0, 0.6);
      }

      .price-row.total {
        font-size: 18px;
        font-weight: 600;
        color: #4caf50;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
        padding-top: 16px;
        margin-top: 8px;
      }

      .submit-btn {
        height: 48px;
      }

      mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class BookingCreateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private stationsService = inject(StationsService);
  private bookingsService = inject(BookingsService);
  private snackBar = inject(MatSnackBar);

  station: Station | null = null;
  isLoadingStation = true;
  isSubmitting = false;
  minDate = new Date();

  bookingForm: FormGroup = this.fb.group({
    date: [null, [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    energyRequested: [10, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    const stationId = this.route.snapshot.paramMap.get('stationId');
    if (stationId) {
      this.loadStation(stationId);
    }
  }

  loadStation(id: string): void {
    this.stationsService.getById(id).subscribe({
      next: (station) => {
        this.station = station;
        this.isLoadingStation = false;
      },
      error: () => {
        this.isLoadingStation = false;
        this.router.navigate(['/stations']);
      },
    });
  }

  calculateDuration(): number {
    const start = this.bookingForm.get('startTime')?.value;
    const end = this.bookingForm.get('endTime')?.value;

    if (!start || !end) return 0;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return Math.max(0, endMinutes - startMinutes);
  }

  calculateMaxEnergy(): number {
    if (!this.station) return 0;
    const duration = this.calculateDuration();
    return (this.station.power * duration) / 60;
  }

  calculateTotal(): number {
    if (!this.station) return 0;
    const energy = this.bookingForm.get('energyRequested')?.value || 0;
    return energy * this.station.pricePerKwh;
  }

  goBack(): void {
    if (this.station) {
      this.router.navigate(['/stations', this.station.id]);
    } else {
      this.router.navigate(['/stations']);
    }
  }

  onSubmit(): void {
    if (this.bookingForm.invalid || !this.station) return;

    this.isSubmitting = true;
    const { date, startTime, endTime, energyRequested } = this.bookingForm.value;

    const startDateTime = new Date(date);
    const [startH, startM] = startTime.split(':').map(Number);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(date);
    const [endH, endM] = endTime.split(':').map(Number);
    endDateTime.setHours(endH, endM, 0, 0);

    this.bookingsService
      .create({
        stationId: this.station.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        energyRequested,
      })
      .subscribe({
        next: (booking) => {
          this.snackBar.open('Réservation créée avec succès !', 'Fermer', {
            duration: 3000,
          });
          this.router.navigate(['/bookings', booking.id]);
        },
        error: (err) => {
          this.isSubmitting = false;
          const message = err.error?.message || 'Erreur lors de la réservation';
          this.snackBar.open(message, 'Fermer', { duration: 5000 });
        },
      });
  }
}
