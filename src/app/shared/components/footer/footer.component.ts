import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h3>Electricity Business</h3>
          <p>Plateforme de location de bornes de recharge électrique</p>
        </div>

        <div class="footer-section">
          <h4>Navigation</h4>
          <ul>
            <li><a routerLink="/stations">Stations</a></li>
            <li><a routerLink="/dashboard">Dashboard</a></li>
            <li><a routerLink="/bookings">Réservations</a></li>
            <li><a routerLink="/dashboard/my-stations">Mes bornes</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Informations</h4>
          <ul>
            <li><a href="#">À propos</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Conditions d'utilisation</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>Suivez-nous</h4>
          <div class="social-links">
            <a href="#" aria-label="Facebook">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="#" aria-label="Twitter">
              <mat-icon>twitter</mat-icon>
            </a>
            <a href="#" aria-label="Instagram">
              <mat-icon>instagram</mat-icon>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Electricity Business. Tous droits réservés.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
      color: #e8f5e9;
      padding: 40px 20px 20px;
      margin-top: auto;
      box-shadow: 0 -4px 20px rgba(76, 175, 80, 0.1);
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      padding-bottom: 30px;
    }

    .footer-section {
      h3 {
        margin: 0 0 16px 0;
        font-size: 1.5rem;
        color: #fff;
        font-weight: 600;
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        color: #a5d6a7;
        font-weight: 500;
      }

      p {
        margin: 0;
        color: #c8e6c9;
        line-height: 1.6;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;

          a {
            color: #c8e6c9;
            text-decoration: none;
            transition: color 0.2s;

            &:hover {
              color: #00e676;
            }
          }
        }
      }
    }

    .social-links {
      display: flex;
      gap: 12px;

      a {
        color: #c8e6c9;
        transition: all 0.2s;

        &:hover {
          color: #00e676;
          transform: translateY(-2px);
        }

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }
    }

    .footer-bottom {
      max-width: 1400px;
      margin: 0 auto;
      padding-top: 20px;
      border-top: 1px solid rgba(165, 214, 167, 0.3);
      text-align: center;

      p {
        margin: 0;
        color: #a5d6a7;
        font-size: 0.875rem;
      }
    }
  `],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
