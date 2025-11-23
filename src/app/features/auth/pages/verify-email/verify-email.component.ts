import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '@env/environment';

@Component({
  selector: 'app-verify-email',
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
    <div class="verify-container">
      <mat-card>
        <mat-card-content>
          <div class="status-content">
            @if (loading) {
              <mat-spinner diameter="48"></mat-spinner>
              <p>Vérification de votre email en cours...</p>
            } @else if (success) {
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>Email vérifié !</h2>
              <p>Votre compte a été activé avec succès.</p>
              <a mat-raised-button color="primary" routerLink="/auth/login">
                Se connecter
              </a>
            } @else {
              <mat-icon class="error-icon">error</mat-icon>
              <h2>Échec de la vérification</h2>
              <p>{{ errorMessage }}</p>
              <a mat-button color="primary" routerLink="/auth/login">
                Retour à la connexion
              </a>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .verify-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    mat-card {
      max-width: 400px;
      width: 100%;
      text-align: center;
    }

    .status-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 24px 0;
    }

    .success-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: var(--primary-color);
    }

    .error-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: var(--warn-color);
    }

    h2 {
      margin: 0;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl + '/auth';

  loading = true;
  success = false;
  errorMessage = '';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const email = params['email'];
      const code = params['code'];

      if (email && code) {
        this.verifyEmail(email, code);
      } else {
        this.loading = false;
        this.errorMessage = 'Lien de vérification invalide.';
      }
    });
  }

  private verifyEmail(email: string, code: string) {
    this.http.post(`${this.apiUrl}/verify-email`, { email, code }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (error) => {
        this.loading = false;
        this.success = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue lors de la vérification.';
      }
    });
  }
}
