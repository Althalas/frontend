import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '@core/services/auth.service';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  isValidated: boolean;
  isActive: boolean;
}

interface Station {
  id: number;
  name: string;
  city: string;
  powerKva: number;
  isActive: boolean;
  deletedAt: string | null;
  deletionReason: string | null;
  deletedBy: string | null;
  location: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Reservation {
  id: number;
  startDatetime: string;
  endDatetime: string;
  totalAmount: number;
  status: string;
  cancellationReason: string | null;
  cancelledBy: string | null;
  refusedBy: string | null;
  renter: {
    firstName: string;
    lastName: string;
    email: string;
  };
  chargingStation: {
    name: string;
    city: string;
  };
}

interface Stats {
  totalUsers: number;
  totalStations: number;
  totalReservations: number;
  pendingReservations: number;
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
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private apiUrl = environment.apiUrl;

  users: User[] = [];
  stations: Station[] = [];
  reservations: Reservation[] = [];
  
  stats: Stats = {
    totalUsers: 0,
    totalStations: 0,
    totalReservations: 0,
    pendingReservations: 0,
    pendingValidations: 0,
  };

  displayedUserColumns = ['id', 'name', 'email', 'role', 'status', 'active', 'actions'];
  displayedStationColumns = ['id', 'name', 'city', 'power', 'owner', 'status', 'actions'];
  displayedReservationColumns = ['id', 'station', 'renter', 'dates', 'amount', 'status', 'actions'];

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
    this.loadStations();
    this.loadReservations();
  }

  isCurrentUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.id === user.id;
  }

  hasAdminRole(user: User): boolean {
    return user.roles?.includes('admin') || false;
  }

  toggleStatus(user: User) {
    this.http.patch(`${this.apiUrl}/users/${user.id}/toggle-status`, {}).subscribe({
      next: () => {
        user.isActive = !user.isActive;
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
      },
    });
  }

  private loadUsers() {
    this.http.get<{ data: User[]; meta: any }>(`${this.apiUrl}/users`).subscribe({
      next: (response) => {
        this.users = response.data;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      },
    });
  }

  private loadStats() {
    this.http.get<Stats>(`${this.apiUrl}/admin/stats`).subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      },
    });
  }

  private loadStations() {
    this.http.get<Station[]>(`${this.apiUrl}/admin/stations`).subscribe({
      next: (stations) => {
        this.stations = stations;
      },
      error: (error) => {
        console.error('Error loading stations:', error);
      },
    });
  }

  private loadReservations() {
    this.http.get<Reservation[]>(`${this.apiUrl}/admin/reservations`).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
      },
    });
  }

  async deleteStation(station: Station) {
    const reason = await this.promptForReason(
      'Supprimer la borne',
      `Pourquoi supprimez-vous "${station.name}" ?`
    );
    
    if (!reason) return;

    this.http.delete(`${this.apiUrl}/admin/stations/${station.id}`, {
      body: { reason }
    }).subscribe({
      next: () => {
        this.loadStations();
      },
      error: (error) => {
        console.error('Error deleting station:', error);
      },
    });
  }

  async cancelReservation(reservation: Reservation) {
    const reason = await this.promptForReason(
      'Annuler la réservation',
      `Pourquoi annulez-vous cette réservation ?`
    );
    
    if (!reason) return;

    this.http.patch(`${this.apiUrl}/admin/reservations/${reservation.id}/cancel`, {
      reason
    }).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error cancelling reservation:', error);
      },
    });
  }

  canCancelReservation(reservation: Reservation): boolean {
    return reservation.status !== 'cancelled' && reservation.status !== 'completed';
  }

  private promptForReason(title: string, message: string): Promise<string | null> {
    return new Promise((resolve) => {
      const reason = prompt(`${title}\n\n${message}`);
      resolve(reason);
    });
  }

  approveReservation(reservation: Reservation) {
    if (confirm(`Voulez-vous approuver cette réservation de ${reservation.renter.firstName} ${reservation.renter.lastName} ?`)) {
      this.http.patch(`${this.apiUrl}/admin/reservations/${reservation.id}/approve`, {}).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error approving reservation:', error);
        },
      });
    }
  }

  async rejectReservation(reservation: Reservation) {
    const reason = await this.promptForReason(
      'Rejeter la réservation',
      `Pourquoi rejetez-vous cette réservation ?`
    );
    
    if (!reason) return;

    this.http.patch(`${this.apiUrl}/admin/reservations/${reservation.id}/reject`, {
      reason
    }).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error rejecting reservation:', error);
      },
    });
  }

  downloadReceipt(reservationId: number) {
    window.open(`${this.apiUrl}/bookings/${reservationId}/receipt`, '_blank');
  }

  getCancellationTooltip(reservation: Reservation): string {
    const who = reservation.cancelledBy === 'admin' ? 'ADMIN' : 'Utilisateur';
    return `Annulée par ${who}: ${reservation.cancellationReason}`;
  }

  getRefusalTooltip(reservation: Reservation): string {
    const who = reservation.refusedBy === 'admin' ? 'ADMIN' : 'Propriétaire';
    return `Refusée par ${who}: ${reservation.cancellationReason}`;
  }

  getDeletionTooltip(station: Station): string {
    const who = station.deletedBy === 'admin' ? 'ADMIN' : station.deletedBy || 'Inconnu';
    return `Supprimée par ${who}: ${station.deletionReason}`;
  }
}
