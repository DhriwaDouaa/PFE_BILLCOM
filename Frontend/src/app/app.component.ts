import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, FooterComponent],
  template: `
    <!-- Login page — sans sidebar -->
    <div *ngIf="isLoginPage()">
      <router-outlet></router-outlet>
    </div>

    <!-- Autres pages — avec sidebar -->
    <div class="d-flex" *ngIf="!isLoginPage()">
      <!-- Sidebar -->
      <div class="sidebar d-flex flex-column" style="width:250px; height:100vh; position:fixed; top:0; left:0; z-index:100; overflow-y:auto; overflow-x:hidden;">

        <!-- Logo -->
        <div class="p-4 border-bottom border-white border-opacity-10">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-car-front-fill text-info fs-3"></i>
            <div>
              <div class="text-white fw-bold">BSS as a Service</div>
              <div class="text-white-50 small" *ngIf="isAdminOrSupervisor() || isAgent()">
                IHM BSS — Opérateur
              </div>
              <div class="text-white-50 small" *ngIf="isMember()">
                IHM SIMULATION — Abonné
              </div>
            </div>
          </div>
        </div>

        <!-- Admin/Supervisor Section -->
        <div class="px-2 pt-3" *ngIf="isAdminOrSupervisor()">
          <div class="text-white-50 small text-uppercase px-3 mb-2 fw-semibold"
               style="letter-spacing:0.1em">Admin</div>
          <ul class="nav flex-column gap-1">
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/customers" routerLinkActive="active">
                <i class="bi bi-people-fill"></i> Customers
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/health" routerLinkActive="active">
                <i class="bi bi-heart-pulse"></i> Health Check
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/services" routerLinkActive="active">
                <i class="bi bi-gear-fill"></i> Services
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/invoices" routerLinkActive="active">
                <i class="bi bi-receipt"></i> Factures
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/payments" routerLinkActive="active">
                <i class="bi bi-credit-card-fill"></i> Paiements
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/cdr" routerLinkActive="active">
                <i class="bi bi-table"></i> CDR Logs
              </a>
            </li>
            <li *ngIf="isAdminOrSupervisor()">
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/user-logs" routerLinkActive="active">
                <i class="bi bi-journal-check"></i> User Logs
              </a>
            </li>
            <li *ngIf="isAdmin()">
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/user-management" routerLinkActive="active">
                <i class="bi bi-person-gear"></i> User Management
              </a>
            </li>
          </ul>
        </div>

        <!-- Agent Section -->
        <div class="px-2 pt-3" *ngIf="isAgent()">
          <div class="text-white-50 small text-uppercase px-3 mb-2 fw-semibold"
               style="letter-spacing:0.1em">Agent</div>
          <ul class="nav flex-column gap-1">
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/dashboard" routerLinkActive="active">
                <i class="bi bi-speedometer2"></i> Dashboard
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/customers" routerLinkActive="active">
                <i class="bi bi-people-fill"></i> Mes Clients
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/cdr" routerLinkActive="active">
                <i class="bi bi-table"></i> CDR Logs
              </a>
            </li>
            <li>
              <a class="nav-link d-flex align-items-center gap-2"
                 routerLink="/admin/invoices" routerLinkActive="active">
                <i class="bi bi-receipt"></i> Factures
              </a>
            </li>
          </ul>
        </div>

        <!-- Member Section -->
        <!-- Member Section -->
<div class="px-2 pt-3" *ngIf="isMember()">
  <div class="text-white-50 small text-uppercase px-3 mb-2 fw-semibold"
       style="letter-spacing:0.1em">Abonné</div>
  <ul class="nav flex-column gap-1">
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/profile" routerLinkActive="active">
        <i class="bi bi-person-circle"></i> Profil
      </a>
    </li>
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/vehicules" routerLinkActive="active">
        <i class="bi bi-car-front-fill"></i> Véhicules
      </a>
    </li>
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/mes-services" routerLinkActive="active">
        <i class="bi bi-grid-fill"></i> Services
      </a>
    </li>
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/recharge" routerLinkActive="active">
        <i class="bi bi-wallet2"></i> Recharge
      </a>
    </li>
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/abonnements" routerLinkActive="active">
        <i class="bi bi-credit-card-fill"></i> Mes abonnements
      </a>
    </li>
    <li>
      <a class="nav-link d-flex align-items-center gap-2"
         routerLink="/member/factures" routerLinkActive="active">
        <i class="bi bi-receipt"></i> Factures
      </a>
    </li>
  </ul>
</div>
        <!-- User Info + Logout -->
        <div class="mt-auto p-3 border-top border-white border-opacity-10">
          <div class="d-flex align-items-center gap-2 mb-1">
            <div class="bg-info bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center"
                 style="width:32px;height:32px;">
              <i class="bi bi-person-fill text-info"></i>
            </div>
            <div>
              <small class="text-white fw-semibold">{{ getUsername() }}</small>
              <div>
                <span class="badge badge-sm"
                  [class.bg-danger]="isAdmin()"
                  [class.bg-warning]="isSupervisor()"
                  [class.bg-primary]="isAgent()"
                  [class.bg-info]="isMember()"
                  style="font-size:0.65rem">
                  {{ getRole() }}
                </span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 mb-2 mt-2">
            <div class="bg-success rounded-circle" style="width:8px;height:8px;"></div>
            <small class="text-white-50">API Connectée</small>
          </div>
          <a routerLink="/login" class="btn btn-sm btn-outline-danger w-100" (click)="logout()">
            <i class="bi bi-box-arrow-right me-1"></i> Déconnexion
          </a>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content flex-grow-1 d-flex flex-column" style="margin-left:250px;">

        <!-- Top bar -->
        <div class="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm">
          <div class="d-flex align-items-center gap-3">
            <i class="bi bi-car-front-fill text-info me-2"></i>
            <span class="fw-semibold text-muted">BSS as a Service</span>
            <!-- Badge IHM -->
            <span *ngIf="isAdminOrSupervisor() || isAgent()"
                  class="badge bg-primary">
              <i class="bi bi-display me-1"></i>IHM BSS — Opérateur
            </span>
            <span *ngIf="isMember()"
                  class="badge bg-success">
              <i class="bi bi-phone me-1"></i>IHM SIMULATION — Abonné
            </span>
          </div>
          <div class="d-flex align-items-center gap-3">
            <span class="badge bg-success bg-opacity-10 text-success">
              <i class="bi bi-circle-fill me-1" style="font-size:6px"></i>En ligne
            </span>
            <span class="text-muted small">{{ getUsername() }}</span>
            <div class="bg-info bg-opacity-10 rounded-circle p-2">
              <i class="bi bi-person-fill text-info"></i>
            </div>
          </div>
        </div>

        <!-- Router outlet -->
        <div class="flex-grow-1">
          <router-outlet></router-outlet>
        </div>

        <!-- Footer -->
        <div class="bg-white border-top px-4 py-2 text-center">
          <small class="text-muted">
            <i class="bi bi-car-front-fill text-info me-1"></i>
            BSS as a Service © 2026
          </small>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  isAdmin(): boolean {
    return localStorage.getItem('role') === 'ADMIN';
  }

  isSupervisor(): boolean {
    return localStorage.getItem('role') === 'SUPERVISOR';
  }

  isMember(): boolean {
    return localStorage.getItem('role') === 'MEMBER';
  }

  isAgent(): boolean {
    return localStorage.getItem('role') === 'AGENT';
  }

  isAdminOrSupervisor(): boolean {
    const role = localStorage.getItem('role');
    return role === 'ADMIN' || role === 'SUPERVISOR';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
