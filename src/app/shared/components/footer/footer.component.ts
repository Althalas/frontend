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
      background-color: #263238;
      color: #eceff1;
      padding: 40px 20px 20px;
      margin-top: auto;
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
      }

      h4 {
        margin: 0 0 12px 0;
        font-size: 1.1rem;
        color: #fff;
      }

      p {
        margin: 0;
        color: #b0bec5;
        line-height: 1.6;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          margin-bottom: 8px;

          a {
            color: #b0bec5;
            text-decoration: none;
            transition: color 0.2s;

            &:hover {
              color: #fff;
            }
          }
        }
      }
    }

    .social-links {
      display: flex;
      gap: 12px;

      a {
        color: #b0bec5;
        transition: color 0.2s;

        &:hover {
          color: #fff;
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
      border-top: 1px solid #37474f;
      text-align: center;

      p {
        margin: 0;
        color: #78909c;
        font-size: 0.875rem;
      }
    }
  `],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
