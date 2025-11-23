import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  template: `
    <div class="profile-container">
      <h1>Mon profil</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Informations personnelles</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm" (ngSubmit)="onSubmitProfile()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="firstName" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              <mat-icon matSuffix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Téléphone</mat-label>
              <input matInput type="tel" formControlName="phone" />
              <mat-icon matSuffix>phone</mat-icon>
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              [disabled]="profileForm.invalid || isUpdating"
            >
              @if (isUpdating) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else { Mettre à jour }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Changer le mot de passe</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="passwordForm" (ngSubmit)="onSubmitPassword()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe actuel</mat-label>
              <input
                matInput
                [type]="hideCurrentPassword ? 'password' : 'text'"
                formControlName="currentPassword"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hideCurrentPassword = !hideCurrentPassword"
              >
                <mat-icon>{{
                  hideCurrentPassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nouveau mot de passe</mat-label>
              <input
                matInput
                [type]="hideNewPassword ? 'password' : 'text'"
                formControlName="newPassword"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hideNewPassword = !hideNewPassword"
              >
                <mat-icon>{{
                  hideNewPassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if (passwordForm.get('newPassword')?.hasError('minlength')) {
              <mat-error>Minimum 8 caractères</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmer le nouveau mot de passe</mat-label>
              <input
                matInput
                [type]="hideConfirmPassword ? 'password' : 'text'"
                formControlName="confirmPassword"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hideConfirmPassword = !hideConfirmPassword"
              >
                <mat-icon>{{
                  hideConfirmPassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
            </mat-form-field>

            <button
              mat-raised-button
              color="accent"
              type="submit"
              [disabled]="passwordForm.invalid || isChangingPassword"
            >
              @if (isChangingPassword) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else { Changer le mot de passe }
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="danger-zone">
        <mat-card-header>
          <mat-card-title>Zone de danger</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>
            La suppression de votre compte est irréversible. Toutes vos données
            seront définitivement effacées.
          </p>
          <button mat-raised-button color="warn">
            <mat-icon>delete_forever</mat-icon>
            Supprimer mon compte
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .profile-container {
        padding: 20px;
        max-width: 600px;
        margin: 0 auto;
      }

      h1 {
        margin: 0 0 24px;
      }

      mat-card {
        margin-bottom: 20px;
      }

      mat-card-header {
        margin-bottom: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
      }

      .form-row mat-form-field {
        flex: 1;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        margin-bottom: 8px;
      }

      mat-spinner {
        display: inline-block;
      }

      .danger-zone {
        border: 1px solid #f44336;
      }

      .danger-zone mat-card-title {
        color: #f44336;
      }

      .danger-zone p {
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 16px;
      }
    `,
  ],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  profileForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isUpdating = false;
  isChangingPassword = false;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      });
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) return;

    this.isUpdating = true;

    // TODO: Implement profile update API call
    setTimeout(() => {
      this.isUpdating = false;
      this.snackBar.open('Profil mis à jour !', 'Fermer', { duration: 3000 });
    }, 1000);
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    this.isChangingPassword = true;

    // TODO: Implement password change API call
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordForm.reset();
      this.snackBar.open('Mot de passe modifié !', 'Fermer', { duration: 3000 });
    }, 1000);
  }
}
