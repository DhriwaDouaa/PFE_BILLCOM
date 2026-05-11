import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4 px-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-primary bg-opacity-10 p-3 rounded-3">
              <i class="bi bi-heart-pulse text-primary fs-3"></i>
            </div>
            <div>
              <h2 class="fw-bold mb-0">Health Check</h2>
              <p class="text-muted mb-0">Statut de l'API Spring Boot</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body text-center py-5">
              <div *ngIf="loading" class="spinner-border text-primary mb-3" role="status"></div>
              <div *ngIf="!loading">
                <i class="bi fs-1 mb-3 d-block"
                   [class]="status === 'UP' ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'"></i>
                <h3 class="fw-bold" [class]="status === 'UP' ? 'text-success' : 'text-danger'">
                  API {{ status }}
                </h3>
                <p class="text-muted">Spring Boot sur http://localhost:8080</p>
              </div>
              <button class="btn btn-outline-primary mt-3" (click)="check()">
                <i class="bi bi-arrow-clockwise me-1"></i>Vérifier à nouveau
              </button>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 pt-3">
              <h5 class="fw-bold mb-0">Endpoints disponibles</h5>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center px-0" *ngFor="let ep of endpoints">
                  <div>
                    <span class="badge me-2" [class]="ep.method === 'GET' ? 'bg-success' : ep.method === 'POST' ? 'bg-primary' : ep.method === 'PUT' ? 'bg-warning text-dark' : 'bg-danger'">
                      {{ ep.method }}
                    </span>
                    <code class="text-info">{{ ep.path }}</code>
                  </div>
                  <small class="text-muted">{{ ep.desc }}</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthComponent implements OnInit {
  status = '';
  loading = true;

  endpoints = [
    { method: 'GET', path: '/api/customers', desc: 'Liste customers' },
    { method: 'POST', path: '/api/customers', desc: 'Créer customer' },
    { method: 'PUT', path: '/api/customers/{id}', desc: 'Modifier customer' },
    { method: 'DELETE', path: '/api/customers/{id}', desc: 'Supprimer customer' },
    { method: 'GET', path: '/api/sensor-logs', desc: 'Liste logs' },
    { method: 'POST', path: '/api/sensor-logs', desc: 'Créer log' },
    { method: 'DELETE', path: '/api/sensor-logs/{id}', desc: 'Supprimer log' },
    { method: 'GET', path: '/api/health', desc: 'Health check' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit() { this.check(); }

  check() {
    this.loading = true;
    this.api.get<any>('health').subscribe({
      next: () => { this.status = 'UP'; this.loading = false; },
      error: () => { this.status = 'DOWN'; this.loading = false; }
    });
  }
}
