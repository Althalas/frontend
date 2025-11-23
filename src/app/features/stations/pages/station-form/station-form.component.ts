import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StationsService, Station } from '@core/services/stations.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-station-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="station-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{
            isEditing ? 'Modifier la borne' : 'Ajouter une borne'
          }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="stationForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-checkbox formControlName="isOnStand" color="primary">
                Borne sur stand
              </mat-checkbox>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom de la borne</mat-label>
                <input matInput formControlName="name" placeholder="Ex: Borne Centre Ville" />
                <mat-error *ngIf="stationForm.get('name')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Adresse</mat-label>
                <input matInput formControlName="address" placeholder="Adresse complète" />
                <mat-error *ngIf="stationForm.get('address')?.hasError('required')">
                  L'adresse est requise
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-cols">
              <mat-form-field appearance="outline">
                <mat-label>Code Postal</mat-label>
                <input matInput formControlName="postalCode" placeholder="75001" />
                <mat-error *ngIf="stationForm.get('postalCode')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ville</mat-label>
                <input matInput formControlName="city" placeholder="Paris" />
                <mat-error *ngIf="stationForm.get('city')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-cols">
              <mat-form-field appearance="outline">
                <mat-label>Latitude</mat-label>
                <input matInput type="number" formControlName="latitude" />
                <mat-error *ngIf="stationForm.get('latitude')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Longitude</mat-label>
                <input matInput type="number" formControlName="longitude" />
                <mat-error *ngIf="stationForm.get('longitude')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Puissance (kW)</mat-label>
                <input matInput type="number" formControlName="power" />
                <mat-error *ngIf="stationForm.get('power')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row two-cols">
              <mat-form-field appearance="outline">
                <mat-label>Type de connecteur</mat-label>
                <mat-select formControlName="connector">
                  <mat-option value="TYPE2">Type 2</mat-option>
                  <mat-option value="CCS">CCS (Combined Charging System)</mat-option>
                  <mat-option value="CHADEMO">CHAdeMO</mat-option>
                  <mat-option value="DOMESTIC">Prise domestique</mat-option>
                </mat-select>
                <mat-error *ngIf="stationForm.get('connector')?.hasError('required')">
                  Le type de connecteur est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Prix (€/kWh)</mat-label>
                <input matInput type="number" formControlName="pricePerKwh" />
                <mat-error *ngIf="stationForm.get('pricePerKwh')?.hasError('required')">
                  Requis
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Instructions</mat-label>
                <textarea matInput formControlName="instructions" placeholder="Instructions pour accéder à la borne..." rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="photos-section">
              <h3>Photos</h3>
              <div formArrayName="photos">
                <div
                  *ngFor="let photo of photos.controls; let i = index"
                  class="photo-row"
                >
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>URL de la photo {{ i + 1 }}</mat-label>
                    <input matInput [formControlName]="i" />
                  </mat-form-field>
                  <button
                    mat-icon-button
                    color="warn"
                    type="button"
                    (click)="removePhoto(i)"
                    [disabled]="photos.length === 1"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              <button mat-button type="button" (click)="addPhoto()">
                <mat-icon>add</mat-icon> Ajouter une photo
              </button>
            </div>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/stations">Annuler</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="stationForm.invalid || isSubmitting"
              >
                {{ isEditing ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .station-form-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }

      .form-row {
        margin-bottom: 16px;
      }

      .two-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .full-width {
        width: 100%;
      }

      .photos-section {
        margin: 24px 0;
      }

      .photo-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-top: 24px;
      }

      @media (max-width: 600px) {
        .two-cols {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class StationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stationsService = inject(StationsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  stationForm: FormGroup;
  isEditing = false;
  stationId: string | null = null;
  isSubmitting = false;

  constructor() {
    this.stationForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      city: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      power: [null, [Validators.required, Validators.min(0)]],
      connector: ['TYPE2', Validators.required],
      pricePerKwh: [null, [Validators.required, Validators.min(0)]],
      instructions: [''],
      isOnStand: [false],
      photos: this.fb.array([this.fb.control('')]),
    });
  }

  get photos() {
    return this.stationForm.get('photos') as FormArray;
  }

  ngOnInit(): void {
    this.stationId = this.route.snapshot.paramMap.get('id');
    
    // Check for query params (coordinates from map)
    this.route.queryParams.subscribe(params => {
      if (params['lat'] && params['lng']) {
        this.stationForm.patchValue({
          latitude: Number(params['lat']),
          longitude: Number(params['lng'])
        });
      }
    });

    if (this.stationId) {
      this.isEditing = true;
      this.loadStation(Number(this.stationId));
    }
  }

  loadStation(id: number): void {
    this.stationsService.getById(id).subscribe({
      next: (station) => {
        this.stationForm.patchValue({
          name: station.name,
          address: station.location?.address || '',
          postalCode: station.location?.postalCode || '',
          city: station.city || station.location?.city || '',
          latitude: station.latitude,
          longitude: station.longitude,
          power: station.powerKva,
          connector: station.connectorType || 'TYPE2',
          pricePerKwh: station.pricing?.[0]?.hourlyRate || 0,
          instructions: station.instructions || '',
          isOnStand: station.isOnStand || false,
        });

        // Photos not supported yet
        this.photos.clear();
        this.photos.push(this.fb.control(''));
      },
      error: () => {
        this.showSnackBar('Erreur lors du chargement de la borne');
        this.router.navigate(['/stations']);
      },
    });
  }

  addPhoto(): void {
    this.photos.push(this.fb.control(''));
  }

  removePhoto(index: number): void {
    this.photos.removeAt(index);
  }

  onSubmit(): void {
    if (this.stationForm.invalid) return;

    this.isSubmitting = true;
    const formValue = this.stationForm.value;

    // Filter out empty photo URLs
    formValue.photos = formValue.photos.filter((p: string) => p.trim() !== '');

    const request$ = this.isEditing && this.stationId
      ? this.stationsService.update(Number(this.stationId), formValue)
      : this.stationsService.create(formValue);

    request$.subscribe({
      next: () => {
        this.showSnackBar(
          this.isEditing ? 'Borne mise à jour avec succès' : 'Borne créée avec succès'
        );

        // Refresh profile to update role if needed
        this.authService.refreshProfile().subscribe(() => {
          this.router.navigate(['/stations']);
        });
      },
      error: () => {
        this.showSnackBar(
          this.isEditing
            ? 'Erreur lors de la mise à jour'
            : 'Erreur lors de la création'
        );
        this.isSubmitting = false;
      },
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
