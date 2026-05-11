import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark px-4 py-2"
         style="background: linear-gradient(135deg, #1a1a2e, #0f3460);">
      <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/">
        <i class="bi bi-car-front-fill text-info fs-4"></i>
        <span class="fw-bold">PFE <span class="text-info">SmartCar</span></span>
      </a>
      <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="nav">
        <ul class="navbar-nav ms-auto gap-1">
          <li class="nav-item">
            <a class="nav-link rounded px-3" routerLink="/admin/dashboard" routerLinkActive="text-info fw-semibold">
              <i class="bi bi-speedometer2 me-1"></i>Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link rounded px-3" routerLink="/admin/customers" routerLinkActive="text-info fw-semibold">
              <i class="bi bi-people-fill me-1"></i>Customers
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link rounded px-3" routerLink="/admin/sensor-logs" routerLinkActive="text-info fw-semibold">
              <i class="bi bi-activity me-1"></i>Sensors
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link rounded px-3" routerLink="/member/profile" routerLinkActive="text-warning fw-semibold">
              <i class="bi bi-person-circle me-1"></i>Profile
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `
})
export class NavbarComponent {}
