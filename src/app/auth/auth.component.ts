import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { SessionService } from './session.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  username = '';
  password = '';
  error: string | null = null;
  forceLoginPrompt: { message: string, action: string } | null = null;

  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router
  ) {}

  onSubmit() {
    this.forceLoginPrompt = null;
    this.error = null;
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.sessionService.startSessionCheck();
        this.router.navigate(['/admin']);
      },
      error: (err) => {
        if (err.message && err.action) {
          this.forceLoginPrompt = { message: err.message, action: err.action };
        } else {
          this.error = 'Login failed. Please check your credentials.';
        }
      }
    });
  }

  onForceLogin() {
    this.authService.forceLogin(this.username, this.password).subscribe({
      next: () => {
        this.sessionService.startSessionCheck();
        this.router.navigate(['/admin']);
      },
      error: () => this.error = 'Force login failed. Please try again.'
    });
  }
}