import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);">
      <div class="container-fluid px-4">
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
          <i class="bi bi-car-front-fill text-info fs-4"></i>
          <span class="fw-bold">PFE <span class="text-info">SmartCar</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto gap-2">
            <li class="nav-item">
              <a class="nav-link px-3 py-2 rounded" routerLink="/dashboard" routerLinkActive="active-link">
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 py-2 rounded" routerLink="/customers" routerLinkActive="active-link">
                <i class="bi bi-people-fill me-1"></i> Customers
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 py-2 rounded" routerLink="/sensor-logs" routerLinkActive="active-link">
                <i class="bi bi-activity me-1"></i> Sensor Logs
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link px-3 py-2 rounded" routerLink="/health" routerLinkActive="active-link">
                <i class="bi bi-heart-pulse me-1"></i> Health
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .active-link {
      background: rgba(13, 202, 240, 0.2);
      color: #0dcaf0 !important;
    }
    .nav-link:hover {
      background: rgba(255,255,255,0.1);
    }
  `]
})
export class NavbarComponent {}
