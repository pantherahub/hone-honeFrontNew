import { Injectable } from '@angular/core';
import { Event, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, filter } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private previousUrl: string | null = null;
  private currentUrl: string | null = null;
  private currentUrl$ = new BehaviorSubject<string | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.router.events
      .pipe(
        filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;
        this.currentUrl$.next(this.currentUrl);
      });
  }

  getPreviousUrl(): string | null {
    return this.previousUrl;
  }

  getCurrentUrl(): string | null {
    return this.currentUrl ?? this.router.url;
  }

  getBackRoute(defaultBackRoute?: string): string {
    if (!defaultBackRoute) {
      defaultBackRoute = this.authService.isAuthenticated()
        ? 'home'
        : 'login';
    }
    const previous = this.getPreviousUrl();
    const current = this.getCurrentUrl();

    // If there is no previous route return to default
    if (!previous || previous === current) {
      return defaultBackRoute;
    }

    return previous;
  }

  getCurrentUrl$() {
    return this.currentUrl$.asObservable();
  }

}
