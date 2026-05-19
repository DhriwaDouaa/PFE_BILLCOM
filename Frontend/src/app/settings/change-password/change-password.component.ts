import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  showCurrent = false;
  showNew = false;
  showConfirm = false;
  loading = false;
  error = '';
  success = false;

  constructor(private http: HttpClient, private router: Router) {}

  get strength(): number {
    const p = this.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 25;
    if (/[A-Z]/.test(p)) s += 25;
    if (/[0-9]/.test(p)) s += 25;
    if (/[!@#$%^&*(),.?":{}|<>@]/.test(p)) s += 25;
    return s;
  }

  get strengthLabel(): string {
    if (this.strength <= 25) return 'Faible';
    if (this.strength <= 50) return 'Moyen';
    if (this.strength <= 75) return 'Bon';
    return 'Fort';
  }

  get strengthColor(): string {
    if (this.strength <= 25) return '#E24B4A';
    if (this.strength <= 50) return '#EF9F27';
    if (this.strength <= 75) return '#378ADD';
    return '#1D9E75';
  }

  get hasUpper(): boolean { return /[A-Z]/.test(this.newPassword); }
  get hasNumber(): boolean { return /[0-9]/.test(this.newPassword); }
  get hasSpecial(): boolean { return /[!@#$%^&*(),.?":{}|<>@]/.test(this.newPassword); }
  get hasLength(): boolean { return this.newPassword.length >= 8; }

  submit(): void {
    this.error = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs'; return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas'; return;
    }
    if (this.strength < 75) {
      this.error = 'Le mot de passe est trop faible'; return;
    }
    this.loading = true;
    const userId = localStorage.getItem('userId');
    this.http.post(`${environment.apiUrl}/auth/change-password`, {
      userId, currentPassword: this.currentPassword, newPassword: this.newPassword
    }).subscribe({
      next: () => { this.loading = false; this.success = true; setTimeout(() => history.back(), 2000); },
      error: (e) => { this.loading = false; this.error = e.error?.message ?? 'Mot de passe actuel incorrect'; }
    });
  }

  goBack(): void { history.back(); }
  getUsername(): string { return localStorage.getItem('username') || ''; }
}
