import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Connexion</mat-card-title>
          <mat-card-subtitle
            >Accédez à votre compte Electricity Business</mat-card-subtitle
          >
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input
                matInput
                type="email"
                formControlName="email"
                placeholder="votre@email.com"
                autocomplete="email"
              />
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required') &&
              loginForm.get('email')?.touched) {
              <mat-error>L'email est requis</mat-error>
              } @if (loginForm.get('email')?.hasError('email')) {
              <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mot de passe</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="
                  hidePassword ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
                "
              >
                <mat-icon>{{
                  hidePassword ? 'visibility_off' : 'visibility'
                }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') &&
              loginForm.get('password')?.touched) {
              <mat-error>Le mot de passe est requis</mat-error>
              }
            </mat-form-field>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="loginForm.invalid || isLoading"
            >
              @if (isLoading) {
              <mat-spinner diameter="20"></mat-spinner>
              } @else { Se connecter }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions align="end">
          <a mat-button routerLink="/auth/register" color="accent">
            Pas encore de compte ? S'inscrire
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: calc(100vh - 64px);
        padding: 20px;
        background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #00796b 100%);
        position: relative;
        overflow: hidden;
      }

      .login-container::before {
        content: '';
        position: absolute;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(76, 175, 80, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        top: -100px;
        right: -100px;
        animation: float 6s ease-in-out infinite;
      }

      .login-container::after {
        content: '';
        position: absolute;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(33, 150, 243, 0.2) 0%, transparent 70%);
        border-radius: 50%;
        bottom: -150px;
        left: -150px;
        animation: float 8s ease-in-out infinite reverse;
      }

      @keyframes float {
        0%, 100% {
          transform: translate(0, 0);
        }
        50% {
          transform: translate(20px, 20px);
        }
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        padding: 20px;
        position: relative;
        z-index: 1;
      }

      mat-card-header {
        margin-bottom: 20px;
      }

      .full-width {
        width: 100%;
      }

      mat-form-field {
        margin-bottom: 16px;
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  hidePassword = true;
  isLoading = false;

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.snackBar.open('Connexion réussie !', 'Fermer', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        const message = err.error?.message || 'Erreur de connexion';
        this.snackBar.open(message, 'Fermer', { duration: 5000 });
      },
    });
  }
}
