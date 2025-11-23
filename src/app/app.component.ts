import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-container">
      @if (showLayout) {
        <app-navbar></app-navbar>
      }

      <main class="main-content" [class.with-layout]="showLayout">
        <router-outlet></router-outlet>
      </main>

      @if (showLayout) {
        <app-footer></app-footer>
      }
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;

      &.with-layout {
        padding-top: 0;
      }

      &:not(.with-layout) {
        padding: 0;
      }
    }
  `],
})
export class AppComponent {
  title = 'Electricity Business';
  showLayout = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Hide layout on auth pages (login, register)
        this.showLayout = !event.url.includes('/auth/');
      });
  }
}
