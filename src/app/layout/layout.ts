import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from '../chatbot/chatbot';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { ReviewService } from '../services/review';
import { LanguageCode, LanguageService } from '../services/language';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatbotComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly language = inject(LanguageService);
  readonly reviewService = inject(ReviewService);
  alertCount = 0;

  constructor(private readonly router: Router) {}

  collapsed = false;
  mobileOpen = false;
  userMenuOpen = false;
  languageMenuOpen = false;

  ngOnInit(): void {
    this.reviewService.getAlertCount().subscribe({
      next: response => {
        const count = response?.count ?? response?.data?.count ?? 0;
        this.alertCount = Number.isFinite(Number(count)) ? Number(count) : 0;
      },
      error: () => this.alertCount = 0
    });
  }

  signOut(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      this.mobileOpen = !this.mobileOpen;
      return;
    }
    this.collapsed = !this.collapsed;
  }

  closeMobile(): void {
    this.mobileOpen = false;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    this.languageMenuOpen = false;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
    this.languageMenuOpen = false;
  }

  toggleLanguageMenu(): void {
    this.languageMenuOpen = !this.languageMenuOpen;
    this.userMenuOpen = false;
  }

  setLanguage(language: LanguageCode): void {
    this.language.setLanguage(language);
    this.languageMenuOpen = false;
  }
}
