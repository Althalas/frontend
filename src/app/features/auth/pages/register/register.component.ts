import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <mat-card-title>Inscription</mat-card-title>
          <mat-card-subtitle
            >Créez votre compte Electricity Business</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="firstName" />
                @if (registerForm.get('firstName')?.hasError('required') &&
                registerForm.get('firstName')?.touched) {
                <mat-error>Requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="lastName" />
                @if (registerForm.get('lastName')?.hasError('required') &&
                registerForm.get('lastName')?.touched) {
                <mat-error>Requis</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                autocomplete="email"
              />
              <mat-icon matSuffix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required') &&
              registerForm.get('email')?.touched) {
              <mat-error>L'email est requis</mat-error>
              } @if (registerForm.get('email')?.hasError('email')) {
              <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Téléphone</mat-label>
              <input matInput type="tel" formControlName="phone" />
              <mat-icon matSuffix>phone</mat-icon>
              @if (registerForm.get('phone')?.hasError('required') &&
              registerForm.get('phone')?.touched) {
              <mat-error>Le téléphone est requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date de naissance</mat-label>
              <input matInput type="date" formControlName="birthDate" />
              <mat-icon matSuffix>cake</mat-icon>
              @if (registerForm.get('birthDate')?.hasError('required') &&
              registerForm.get('birthDate')?.touched) {
              <mat-error>La date de naissance est requise</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="address" />
              <mat-icon matSuffix>home</mat-icon>
              @if (registerForm.get('address')?.hasError('required') &&
              registerForm.get('address')?.touched) {
              <mat-error>L'adresse est requise</mat-error>
              }
            </mat-form-field>

            <div class="name-row">
              <mat-form-field appearance="outline">
                <mat-label>Code postal</mat-label>
                <input matInput formControlName="postalCode" />
                @if (registerForm.get('postalCode')?.hasError('required') &&
                registerForm.get('postalCode')?.touched) {
                <mat-error>Requis</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ville</mat-label>
                <input matInput formControlName="city" />
                @if (registerForm.get('city')?.hasError('required') &&
                registerForm.get('city')?.touched) {
                <mat-error>Requis</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                autocomplete="new-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required') &&
              registerForm.get('password')?.touched) {
              <mat-error>Le mot de passe est requis</mat-error>
              } @if (registerForm.get('password')?.hasError('minlength')) {
              <mat-error>Minimum 8 caractères</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmer le mot de passe</mat-label>
              <input
                matInput
                [type]="hideConfirmPassword ? 'password' : 'text'"
                formControlName="confirmPassword"
                autocomplete="new-password"
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
              @if (registerForm.get('confirmPassword')?.hasError('required') &&
              registerForm.get('confirmPassword')?.touched) {
              <mat-error>Confirmation requise</mat-error>
              } @if (registerForm.hasError('passwordMismatch')) {
              <mat-error>Les mots de passe ne correspondent pas</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="registerForm.invalid || isLoading"
            >
              @if (isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else { S'inscrire }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/auth/login" color="accent">
            Déjà un compte ? Se connecter
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .register-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 64px);
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .register-card {
        width: 100%;
        max-width: 500px;
        padding: 20px;
      }

      mat-card-header {
        margin-bottom: 20px;
      }

      .name-row {
        display: flex;
        gap: 16px;
      }

      .name-row mat-form-field {
        flex: 1;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        margin-bottom: 8px;
      }

      .submit-btn {
        margin-top: 16px;
        height: 48px;
      }

      mat-spinner {
        display: inline-block;
      }
    `,
  ],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      address: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      city: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe({
      next: () => {
        this.snackBar.open('Inscription réussie !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || "Erreur lors de l'inscription";
        this.snackBar.open(message, 'Fermer', { duration: 5000 });
      },
    });
  }
}
