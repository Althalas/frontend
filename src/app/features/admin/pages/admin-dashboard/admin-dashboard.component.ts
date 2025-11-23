import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isValidated: boolean;
  isActive: boolean;
}

interface Stats {
  totalUsers: number;
  totalLocations: number;
  totalReservations: number;
  pendingValidations: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTabsModule,
    MatChipsModule,
  ],
  template: `
    <div class="container">
      <h1>Administration</h1>

      <div class="stats-grid">
        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>people</mat-icon>
              <div class="stat-info">
                <h2>{{ stats.totalUsers }}</h2>
                <p>Utilisateurs</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>ev_station</mat-icon>
              <div class="stat-info">
                <h2>{{ stats.totalLocations }}</h2>
                <p>Bornes</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>calendar_today</mat-icon>
              <div class="stat-info">
                <h2>{{ stats.totalReservations }}</h2>
                <p>Réservations</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <div class="stat">
              <mat-icon>pending_actions</mat-icon>
              <div class="stat-info">
                <h2>{{ stats.pendingValidations }}</h2>
                <p>En attente</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Gestion des utilisateurs</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="users" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-data-cell *matCellDef="let user">{{ user.id }}</td>
            </ng-container>

            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nom</th>
              <td mat-data-cell *matCellDef="let user">
                {{ user.firstName }} {{ user.lastName }}
              </td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-data-cell *matCellDef="let user">{{ user.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Rôle</th>
              <td mat-data-cell *matCellDef="let user">
                <mat-chip [class]="'role-' + user.role">
                  {{ user.role }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Statut</th>
              <td mat-data-cell *matCellDef="let user">
                <mat-chip [class]="user.isValidated ? 'validated' : 'pending'">
                  {{ user.isValidated ? 'Validé' : 'En attente' }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-data-cell *matCellDef="let user">
                <button mat-icon-button [disabled]="user.role === 'admin'">
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  [disabled]="user.role === 'admin'"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .stat mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #3f51b5;
      }

      .stat-info h2 {
        margin: 0;
        font-size: 32px;
        font-weight: 500;
      }

      .stat-info p {
        margin: 0;
        color: #666;
      }

      table {
        width: 100%;
      }

      .role-admin {
        background-color: #f44336;
        color: white;
      }

      .role-owner {
        background-color: #ff9800;
        color: white;
      }

      .role-client {
        background-color: #4caf50;
        color: white;
      }

      .validated {
        background-color: #4caf50;
        color: white;
      }

      .pending {
        background-color: #ff9800;
        color: white;
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  users: User[] = [];
  stats: Stats = {
    totalUsers: 0,
    totalLocations: 0,
    totalReservations: 0,
    pendingValidations: 0,
  };

  displayedColumns = ['id', 'name', 'email', 'role', 'status', 'actions'];

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  private loadUsers() {
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  private loadStats() {
    // TODO: Create dedicated stats endpoint
    this.http.get<User[]>(`${this.apiUrl}/users`).subscribe({
      next: (users) => {
        this.stats.totalUsers = users.length;
        this.stats.pendingValidations = users.filter((u) => !u.isValidated).length;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      },
    });
  }
}
