import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { StationsService, Station } from '@core/services/stations.service';
import { StationCardComponent } from '../../components/station-card/station-card.component';

@Component({
  selector: 'app-stations-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    StationCardComponent,
  ],
  template: `
    <div class="stations-container">
      <div class="page-header">
        <h1>Bornes de recharge disponibles</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" routerLink="/stations/map">
            <mat-icon>map</mat-icon>
            Voir la carte
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <mat-card class="filters-card">
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <mat-form-field appearance="outline">
              <mat-label>Type de connecteur</mat-label>
              <mat-select formControlName="connector">
                <mat-option value="">Tous</mat-option>
                <mat-option value="TYPE2">Type 2</mat-option>
                <mat-option value="CCS">CCS</mat-option>
                <mat-option value="CHADEMO">CHAdeMO</mat-option>
                <mat-option value="DOMESTIC">Domestique</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Puissance min (kW)</mat-label>
              <input matInput type="number" formControlName="minPower" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prix max (€/kWh)</mat-label>
              <input matInput type="number" formControlName="maxPrice" step="0.01" />
            </mat-form-field>

            <button
              mat-raised-button
              color="accent"
              type="button"
              (click)="applyFilters()"
            >
              <mat-icon>filter_list</mat-icon>
              Filtrer
            </button>

            <button mat-button type="button" (click)="resetFilters()">
              Réinitialiser
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Liste des stations -->
      @if (isLoading) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Chargement des bornes...</p>
      </div>
      } @else if (stations.length === 0) {
      <mat-card class="empty-state">
        <mat-card-content>
          <mat-icon>ev_station</mat-icon>
          <h2>Aucune borne trouvée</h2>
          <p>Modifiez vos filtres ou recherchez dans une autre zone.</p>
        </mat-card-content>
      </mat-card>
      } @else {
      <div class="stations-grid">
        @for (station of stations; track station.id) {
        <app-station-card [station]="station"></app-station-card>
        }
      </div>

      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 20, 50]"
        (page)="onPageChange($event)"
        aria-label="Sélectionner la page"
      >
      </mat-paginator>
      }
    </div>
  `,
  styles: [
    `
      .stations-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .page-header h1 {
        margin: 0;
        font-size: 28px;
      }

      .filters-card {
        margin-bottom: 20px;
      }

      .filters-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: center;
      }

      .filters-form mat-form-field {
        flex: 1;
        min-width: 150px;
      }

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px 20px;
      }

      .loading-container p {
        margin-top: 16px;
        color: rgba(0, 0, 0, 0.6);
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
      }

      .stations-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
      }

      mat-paginator {
        background: transparent;
      }

      @media (max-width: 600px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }

        .filters-form {
          flex-direction: column;
        }

        .filters-form mat-form-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class StationsListComponent implements OnInit {
  private stationsService = inject(StationsService);
  private fb = inject(FormBuilder);

  stations: Station[] = [];
  isLoading = false;
  totalItems = 0;
  pageSize = 10;
  currentPage = 1;

  filterForm: FormGroup = this.fb.group({
    connector: [''],
    minPower: [null],
    maxPrice: [null],
  });

  ngOnInit(): void {
    this.loadStations();
  }

  loadStations(): void {
    this.isLoading = true;
    this.stationsService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.stations = response.data;
        this.totalItems = response.meta.total;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    const filters = this.filterForm.value;

    // Remove empty values
    Object.keys(filters).forEach((key) => {
      if (filters[key] === '' || filters[key] === null) {
        delete filters[key];
      }
    });

    this.isLoading = true;
    this.stationsService.search(filters).subscribe({
      next: (stations) => {
        this.stations = stations;
        this.totalItems = stations.length;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.loadStations();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadStations();
  }
}
