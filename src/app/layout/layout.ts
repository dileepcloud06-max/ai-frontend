import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from '../chatbot/chatbot';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ChatbotComponent],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  collapsed = false;
  mobileOpen = false;
  userMenuOpen = false;

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
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }
}
