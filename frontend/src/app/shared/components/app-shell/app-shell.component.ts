import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styles: [`
    .nav-link {
      color: var(--color-text-muted);
    }
    .nav-link:hover {
      background-color: var(--color-surface-2);
      color: var(--color-text);
    }
    .nav-link.nav-active, :host ::ng-deep .nav-active {
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
    }
    .mobile-nav {
      color: var(--color-text-muted);
    }
    .mobile-nav:hover {
      color: var(--color-text);
    }
    .mobile-nav.mobile-nav-active, :host ::ng-deep .mobile-nav-active {
      color: var(--color-primary);
    }
  `]
})
export class AppShellComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly userInitial = () => {
    const name = this.authService.currentUser()?.username ?? '';
    return name.charAt(0).toUpperCase();
  };

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
