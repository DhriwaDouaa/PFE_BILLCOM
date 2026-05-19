import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FooterComponent } from './shared/components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, NgClass, FooterComponent],
  styles: [`
    .avatar-wrap{position:relative;display:inline-block}
    .avatar-btn{display:flex;align-items:center;gap:8px;padding:5px 10px;border-radius:8px;border:0.5px solid rgba(0,0,0,.12);background:#fff;cursor:pointer;transition:background .15s}
    .avatar-btn:hover{background:#f5f5f5}
    .avatar-circle{width:28px;height:28px;border-radius:50%;background:#E6F1FB;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:#0C447C;flex-shrink:0}
    .avatar-chevron{font-size:14px;color:#aaa;transition:transform .2s}
    .avatar-btn.open .avatar-chevron{transform:rotate(180deg)}
    .dropdown-menu-custom{position:absolute;top:calc(100% + 6px);right:0;width:220px;background:#fff;border:0.5px solid rgba(0,0,0,.12);border-radius:12px;overflow:hidden;display:none;z-index:2000;box-shadow:0 4px 16px rgba(0,0,0,.08)}
    .dropdown-menu-custom.show{display:block}
    .drop-header{padding:12px 14px;border-bottom:0.5px solid rgba(0,0,0,.08)}
    .drop-username{font-size:13px;font-weight:500;color:#111}
    .drop-email{font-size:12px;color:#888;margin-top:1px}
    .drop-role-badge{display:inline-block;font-size:10px;padding:1px 7px;border-radius:10px;margin-top:4px;background:#E6F1FB;color:#0C447C;border:0.5px solid #B5D4F4}
    .drop-section{padding:6px 0}
    .drop-section+.drop-section{border-top:0.5px solid rgba(0,0,0,.08)}
    .drop-item{display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;font-size:13px;color:#333;transition:background .15s}
    .drop-item:hover{background:#f5f5f5}
    .drop-item i{font-size:16px;color:#888;flex-shrink:0}
    .drop-item.danger{color:#A32D2D}
    .drop-item.danger i{color:#A32D2D}
    .drop-item.danger:hover{background:#FCEBEB}
    .sidebar{width:250px;height:100vh;position:fixed;top:0;left:0;z-index:1000;overflow-y:auto;overflow-x:hidden;transition:transform 0.3s ease,width 0.3s ease}
    .sidebar.collapsed{width:64px}
    .sidebar.mobile-hidden{transform:translateX(-100%)}
    .sidebar.mobile-open{transform:translateX(0);width:250px !important}
    .overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:999}
    .overlay.show{display:block}
    .main-content{margin-left:250px;transition:margin-left 0.3s ease;min-height:100vh;display:flex;flex-direction:column}
    .main-content.collapsed{margin-left:64px}
    .main-content.full{margin-left:0}
    .nav-label{transition:opacity 0.2s ease;white-space:nowrap;overflow:hidden}
    .sidebar.collapsed .nav-label{opacity:0;width:0;display:none}
    .sidebar.collapsed .section-title{display:none}
    .sidebar.collapsed .logo-text{display:none}
    .sidebar.collapsed .user-info-text{display:none}
    .toggle-arrow{position:absolute;bottom:90px;right:-12px;width:24px;height:24px;border-radius:50%;background:#fff;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:#555;box-shadow:0 1px 4px rgba(0,0,0,.15);z-index:10}
    .hamburger{background:none;border:none;color:#555;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:6px;display:flex;align-items:center}
    .hamburger:hover{background:#f0f0f0}
    @media(max-width:768px){.sidebar{transform:translateX(-100%);width:250px !important}.main-content{margin-left:0 !important}.desktop-only{display:none !important}}
    @media(min-width:769px){.mobile-only{display:none !important}}
  `],
  template: `
    <div *ngIf="isLoginPage()"><router-outlet></router-outlet></div>

    <div *ngIf="!isLoginPage()">
      <div class="overlay" [class.show]="mobileOpen" (click)="closeMobile()"></div>

      <!-- SIDEBAR -->
      <div class="sidebar d-flex flex-column"
           [class.collapsed]="sidebarCollapsed && !isMobile"
           [class.mobile-hidden]="isMobile && !mobileOpen"
           [class.mobile-open]="isMobile && mobileOpen">

        <button class="toggle-arrow desktop-only" (click)="toggleSidebar()">
          <i class="bi" [ngClass]="sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
        </button>

        <!-- Logo -->
        <div class="p-3 border-bottom border-white border-opacity-10">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-car-front-fill text-info fs-4 flex-shrink-0"></i>
            <div class="logo-text">
              <div class="text-white fw-bold" style="font-size:14px">BSS as a Service</div>
              <div class="text-white-50" style="font-size:11px" *ngIf="isAdminOrSupervisor() || isAgent()">IHM BSS — Opérateur</div>
              <div class="text-white-50" style="font-size:11px" *ngIf="isMember()">IHM SIMULATION — Abonné</div>
            </div>
          </div>
        </div>

        <!-- ADMIN -->
        <div class="px-2 pt-3" *ngIf="isAdmin()">
          <div class="text-white-50 small text-uppercase px-2 mb-1 fw-semibold section-title" style="letter-spacing:0.1em;font-size:10px">Admin</div>
          <ul class="nav flex-column gap-1">
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-speedometer2 flex-shrink-0"></i><span class="nav-label">Dashboard</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/customers" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-people-fill flex-shrink-0"></i><span class="nav-label">Customers</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/health" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-heart-pulse flex-shrink-0"></i><span class="nav-label">Health Check</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/services" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-gear-fill flex-shrink-0"></i><span class="nav-label">Services</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/invoices" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-receipt flex-shrink-0"></i><span class="nav-label">Factures</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/subscriptions" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-stars flex-shrink-0"></i><span class="nav-label">Souscriptions</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/payments" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-credit-card-fill flex-shrink-0"></i><span class="nav-label">Paiements</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/cdr" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-table flex-shrink-0"></i><span class="nav-label">CDR Logs</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/user-logs" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-journal-check flex-shrink-0"></i><span class="nav-label">User Logs</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/admin/user-management" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-person-gear flex-shrink-0"></i><span class="nav-label">User Management</span></a></li>
          </ul>
        </div>

        <!-- SUPERVISOR -->
        <div class="px-2 pt-3" *ngIf="isSupervisor()">
          <div class="text-white-50 small text-uppercase px-2 mb-1 fw-semibold section-title" style="letter-spacing:0.1em;font-size:10px">Superviseur</div>
          <ul class="nav flex-column gap-1">
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/supervisor/dashboard" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-speedometer2 flex-shrink-0"></i><span class="nav-label">Dashboard</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/supervisor/agents" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-people-fill flex-shrink-0"></i><span class="nav-label">Mes agents</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/supervisor/clients" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-person-lines-fill flex-shrink-0"></i><span class="nav-label">Mes clients</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/supervisor/rapports" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-bar-chart-fill flex-shrink-0"></i><span class="nav-label">Rapports</span></a></li>
          </ul>
        </div>

        <!-- AGENT -->
        <div class="px-2 pt-3" *ngIf="isAgent()">
          <div class="text-white-50 small text-uppercase px-2 mb-1 fw-semibold section-title" style="letter-spacing:0.1em;font-size:10px">Agent</div>
          <ul class="nav flex-column gap-1">
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/agent/dashboard" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-speedometer2 flex-shrink-0"></i><span class="nav-label">Dashboard</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/agent/vehicules" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-car-front-fill flex-shrink-0"></i><span class="nav-label">Véhicules</span></a></li>
          </ul>
        </div>

        <!-- MEMBER -->
        <div class="px-2 pt-3" *ngIf="isMember()">
          <div class="text-white-50 small text-uppercase px-2 mb-1 fw-semibold section-title" style="letter-spacing:0.1em;font-size:10px">Abonné</div>
          <ul class="nav flex-column gap-1">
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/profile" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-person-circle flex-shrink-0"></i><span class="nav-label">Profil</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/vehicules" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-car-front-fill flex-shrink-0"></i><span class="nav-label">Véhicules</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/mes-services" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-grid-fill flex-shrink-0"></i><span class="nav-label">Services</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/recharge" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-wallet2 flex-shrink-0"></i><span class="nav-label">Recharge</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/abonnements" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-credit-card-fill flex-shrink-0"></i><span class="nav-label">Mes abonnements</span></a></li>
            <li><a class="nav-link d-flex align-items-center gap-2" routerLink="/member/factures" routerLinkActive="active" (click)="closeMobile()"><i class="bi bi-receipt flex-shrink-0"></i><span class="nav-label">Factures</span></a></li>
          </ul>
        </div>

        <!-- User Info -->
        <div class="mt-auto p-3 border-top border-white border-opacity-10">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="bg-info bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width:32px;height:32px;">
              <i class="bi bi-person-fill text-info"></i>
            </div>
            <div class="user-info-text nav-label">
              <small class="text-white fw-semibold d-block">{{ getUsername() }}</small>
              <span class="badge" [class.bg-danger]="isAdmin()" [class.bg-warning]="isSupervisor()" [class.bg-primary]="isAgent()" [class.bg-info]="isMember()" style="font-size:0.6rem">{{ getRole() }}</span>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="bg-success rounded-circle flex-shrink-0" style="width:8px;height:8px;"></div>
            <small class="text-white-50 nav-label">API Connectée</small>
          </div>
          <a routerLink="/login" class="btn btn-sm btn-outline-danger w-100" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i><span class="nav-label ms-1">Déconnexion</span>
          </a>
        </div>
      </div>

      <!-- MAIN CONTENT -->
      <div class="main-content"
           [class.collapsed]="sidebarCollapsed && !isMobile"
           [class.full]="isMobile">

        <!-- Top bar -->
        <div class="bg-white border-bottom px-3 py-2 d-flex justify-content-between align-items-center shadow-sm">
          <div class="d-flex align-items-center gap-2">
            <button class="hamburger mobile-only" (click)="openMobile()"><i class="bi bi-list"></i></button>
            <button class="hamburger desktop-only" (click)="toggleSidebar()"><i class="bi bi-list"></i></button>
            <i class="bi bi-car-front-fill text-info"></i>
            <span class="fw-semibold text-muted d-none d-sm-inline" style="font-size:14px">BSS as a Service</span>
            <span *ngIf="isAdminOrSupervisor() || isAgent()" class="badge bg-primary d-none d-md-inline"><i class="bi bi-display me-1"></i>IHM BSS</span>
            <span *ngIf="isMember()" class="badge bg-success d-none d-md-inline"><i class="bi bi-phone me-1"></i>IHM SIMULATION</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-success bg-opacity-10 text-success"><i class="bi bi-circle-fill me-1" style="font-size:6px"></i>En ligne</span>
            <!-- Avatar dropdown -->
            <div class="avatar-wrap">
              <button class="avatar-btn" [class.open]="dropOpen" (click)="toggleDrop()">
                <div class="avatar-circle">{{ getInitials() }}</div>
                <span class="d-none d-sm-inline" style="font-size:13px;color:#555">{{ getUsername() }}</span>
                <i class="bi bi-chevron-down avatar-chevron"></i>
              </button>
              <div class="dropdown-menu-custom" [class.show]="dropOpen">
                <div class="drop-header">
                  <div class="drop-username">{{ getUsername() }}</div>
                  <div class="drop-email">{{ getEmail() }}</div>
                  <span class="drop-role-badge">{{ getRole() }}</span>
                </div>
                <div class="drop-section">
                  <div class="drop-item" (click)="goProfile()"><i class="bi bi-person"></i> Mon profil</div>
                  <div class="drop-item" (click)="goPassword()"><i class="bi bi-lock"></i> Changer mot de passe</div>
                </div>
                <div class="drop-section">
                  <div class="drop-item danger" (click)="logout()"><i class="bi bi-box-arrow-right"></i> Déconnexion</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-grow-1"><router-outlet></router-outlet></div>

        <div class="bg-white border-top px-4 py-2 text-center">
          <small class="text-muted"><i class="bi bi-car-front-fill text-info me-1"></i>BSS as a Service © 2026</small>
        </div>
      </div>
    </div>
  `
})
export class AppComponent {
  currentUrl = '';
  sidebarCollapsed = false;
  mobileOpen = false;
  isMobile = false;
  dropOpen = false;

  constructor(private router: Router) {
    this.checkMobile();
    this.router.events.subscribe(e => {
      if (e.constructor.name === 'NavigationEnd') {
        this.currentUrl = this.router.url;
        if (this.isMobile) this.mobileOpen = false;
      }
    });
  }

  @HostListener('window:resize')
  checkMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) this.mobileOpen = false;
  }

  toggleSidebar(): void { this.sidebarCollapsed = !this.sidebarCollapsed; }
  openMobile(): void { this.mobileOpen = true; }
  closeMobile(): void { this.mobileOpen = false; }
  toggleDrop(): void { this.dropOpen = !this.dropOpen; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.avatar-wrap')) this.dropOpen = false;
  }

  isLoginPage(): boolean {
    const url = this.currentUrl || this.router.url;
    return url === '/login' || url === '/' || url === '';
  }

  isAdmin(): boolean { return localStorage.getItem('role') === 'ADMIN'; }
  isSupervisor(): boolean { return localStorage.getItem('role') === 'SUPERVISOR'; }
  isMember(): boolean { return localStorage.getItem('role') === 'MEMBER'; }
  isAgent(): boolean { return localStorage.getItem('role') === 'AGENT'; }
  isAdminOrSupervisor(): boolean {
    const role = localStorage.getItem('role');
    return role === 'ADMIN' || role === 'SUPERVISOR';
  }
  getUsername(): string { return localStorage.getItem('username') || ''; }
  getRole(): string { return localStorage.getItem('role') || ''; }
  getEmail(): string { return localStorage.getItem('email') || ''; }

  getInitials(): string {
    return this.getUsername().split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();
  }

  logout(): void {
    localStorage.clear();
    this.dropOpen = false;
    this.router.navigate(['/login']);
  }

  goProfile(): void {
    this.dropOpen = false;
    const role = localStorage.getItem('role');
    if (role === 'MEMBER') this.router.navigate(['/member/profile']);
    else if (role === 'SUPERVISOR') this.router.navigate(['/supervisor/dashboard']);
    else if (role === 'AGENT') this.router.navigate(['/agent/dashboard']);
    else this.router.navigate(['/admin/dashboard']);
  }

  goPassword(): void {
    this.dropOpen = false;
    this.router.navigate(['/settings/password']);
  }
}
