import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <a routerLink="/" class="brand-link">
            <mat-icon>bolt</mat-icon>
            <span>Electricity Business</span>
          </a>
        </div>

        @if (isAuthenticated()) {
          <nav class="navbar-nav">
            <a mat-button routerLink="/dashboard" routerLinkActive="active">
              <mat-icon>dashboard</mat-icon>
              Dashboard
            </a>
            @if (isAdmin()) {
              <a mat-button routerLink="/admin" routerLinkActive="active">
                <mat-icon>admin_panel_settings</mat-icon>
                Admin
              </a>
            }
            <a mat-button routerLink="/stations" routerLinkActive="active">
              <mat-icon>ev_station</mat-icon>
              Stations
            </a>
            <a mat-button routerLink="/stations/map" routerLinkActive="active">
              <mat-icon>map</mat-icon>
              Carte
            </a>
            <a mat-button routerLink="/bookings" routerLinkActive="active">
              <mat-icon>calendar_today</mat-icon>
              Réservations
            </a>
            <a mat-button routerLink="/dashboard/my-stations" routerLinkActive="active">
              <mat-icon>ev_station</mat-icon>
              Mes bornes
            </a>
          </nav>

          <div class="navbar-user">
            <button mat-icon-button [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item routerLink="/dashboard/profile">
                <mat-icon>person</mat-icon>
                <span>Profil</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon>logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </div>
        } @else {
          <div class="navbar-auth">
            <a mat-button routerLink="/auth/login">Connexion</a>
            <a mat-raised-button color="accent" routerLink="/auth/register">
              Inscription
            </a>
          </div>
        }
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
    }

    .navbar-brand {
      .brand-link {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: white;
        font-size: 1.25rem;
        font-weight: 500;

        mat-icon {
          font-size: 28px;
          height: 28px;
          width: 28px;
        }
      }
    }

    .navbar-nav {
      display: flex;
      gap: 8px;
      flex: 1;
      justify-content: center;

      a {
        display: flex;
        align-items: center;
        gap: 6px;

        &.active {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .navbar-user,
    .navbar-auth {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `],
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isOwner(): boolean {
    return this.authService.isOwner();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
