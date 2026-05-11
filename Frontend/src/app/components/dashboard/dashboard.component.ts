import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { SensorLogService } from '../../services/sensor-log.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-4 px-4">
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-info bg-opacity-10 p-3 rounded-3">
              <i class="bi bi-speedometer2 text-info fs-3"></i>
            </div>
            <div>
              <h2 class="fw-bold mb-0">Dashboard</h2>
              <p class="text-muted mb-0">Vue d'ensemble du système SmartCar</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mb-4">
        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm h-100 border-start border-info border-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted small mb-1 text-uppercase fw-semibold">Total Customers</p>
                  <h2 class="fw-bold mb-0 text-info">{{ customerCount }}</h2>
                  <small class="text-success"><i class="bi bi-arrow-up"></i> Actifs</small>
                </div>
                <div class="bg-info bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-people-fill text-info fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm h-100 border-start border-success border-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted small mb-1 text-uppercase fw-semibold">Sensor Logs</p>
                  <h2 class="fw-bold mb-0 text-success">{{ sensorCount }}</h2>
                  <small class="text-success"><i class="bi bi-activity"></i> En temps réel</small>
                </div>
                <div class="bg-success bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-activity text-success fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm h-100 border-start border-primary border-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted small mb-1 text-uppercase fw-semibold">Spring Boot API</p>
                  <h2 class="fw-bold mb-0" [class]="apiStatus === 'UP' ? 'text-success' : 'text-danger'">
                    {{ apiStatus }}
                  </h2>
                  <small class="text-muted">Port 8080</small>
                </div>
                <div class="bg-primary bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-server text-primary fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-xl-3 col-md-6">
          <div class="card border-0 shadow-sm h-100 border-start border-warning border-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <p class="text-muted small mb-1 text-uppercase fw-semibold">Base de données</p>
                  <h2 class="fw-bold mb-0 text-warning">TimesTen</h2>
                  <small class="text-muted">Oracle 22.1</small>
                </div>
                <div class="bg-warning bg-opacity-10 p-3 rounded-3">
                  <i class="bi bi-database-fill text-warning fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 pt-3">
              <h5 class="fw-bold mb-0"><i class="bi bi-lightning-charge text-warning me-2"></i>Actions Rapides</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <a routerLink="/customers" class="btn btn-outline-info d-flex align-items-center gap-2">
                  <i class="bi bi-person-plus-fill"></i> Gérer les Customers
                </a>
                <a routerLink="/sensor-logs" class="btn btn-outline-success d-flex align-items-center gap-2">
                  <i class="bi bi-activity"></i> Voir les Sensor Logs
                </a>
                <a routerLink="/health" class="btn btn-outline-primary d-flex align-items-center gap-2">
                  <i class="bi bi-heart-pulse"></i> Vérifier la Santé API
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 pt-3">
              <h5 class="fw-bold mb-0"><i class="bi bi-info-circle text-info me-2"></i>Informations Système</h5>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Frontend</span>
                  <span class="fw-semibold">Angular 17</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Backend</span>
                  <span class="fw-semibold">Spring Boot 3.2.3</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">Base de données</span>
                  <span class="fw-semibold">Oracle TimesTen 22.1</span>
                </li>
                <li class="list-group-item d-flex justify-content-between px-0">
                  <span class="text-muted">API URL</span>
                  <span class="fw-semibold text-info">localhost:8080/api</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  customerCount = 0;
  sensorCount = 0;
  apiStatus = 'Vérification...';

  constructor(
    private customerService: CustomerService,
    private sensorLogService: SensorLogService,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.customerService.getAll().subscribe({
      next: (data) => this.customerCount = data.length,
      error: () => this.customerCount = 0
    });
    this.sensorLogService.getAll().subscribe({
      next: (data) => this.sensorCount = data.length,
      error: () => this.sensorCount = 0
    });
    this.api.get<any>('health').subscribe({
      next: () => this.apiStatus = 'UP',
      error: () => this.apiStatus = 'DOWN'
    });
  }
}