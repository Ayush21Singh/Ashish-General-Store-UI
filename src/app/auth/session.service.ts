import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  constructor(private authService: AuthService) {}

  startSessionCheck() {
    interval(6000000)
      .pipe(
        switchMap(() => this.authService.refreshToken())
      )
      .subscribe({
        error: () => {
          console.log('Session expired, logging out.');
          this.authService.logout().subscribe();
        }
      });
  }
}