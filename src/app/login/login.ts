import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  isSubmitting = false;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  submit(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    if (!this.auth.login(this.username, this.password)) {
      this.errorMessage = 'Username or password is incorrect.';
      this.isSubmitting = false;
      return;
    }

    this.router.navigateByUrl(this.auth.user()?.role === 'amazon' ? '/amazon' : '/');
  }
}
