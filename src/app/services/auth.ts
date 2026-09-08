import { Injectable, signal } from '@angular/core';

export type UserRole = 'dashboard' | 'amazon';

export interface AuthUser {
  username: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'feedback-intelligence-user';
  readonly user = signal<AuthUser | null>(this.readUser());

  login(username: string, password: string): boolean {
    const credentials: Record<string, { password: string; role: UserRole }> = {
      rekha: { password: '12345678', role: 'dashboard' },
      rekhaamz: { password: '12345678', role: 'amazon' }
    };
    const account = credentials[username.trim().toLowerCase()];

    if (!account || account.password !== password) {
      return false;
    }

    const user = { username: username.trim().toLowerCase(), role: account.role };
    this.user.set(user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
    return true;
  }

  logout(): void {
    this.user.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  private readUser(): AuthUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) as AuthUser : null;
    } catch {
      return null;
    }
  }
}