import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SensorLogService } from '../../../admin/services/sensor-log.service';
import { SensorLog } from '../../../shared/models/sensor-log.model';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-member-logs',
  standalone: true,
  imports: [CommonModule, DatePipe, StatusBadgePipe],
  template: `
    <div class="p-4">
      <div class="d-flex align-items-center gap-3 mb-4">
        <div class="bg-success bg-opacity-10 p-3 rounded-3">
          <i class="bi bi-journal-text text-success fs-2"></i>
        </div>
        <div>
          <h3 class="fw-bold mb-0">Mes Logs Capteurs</h3>
          <p class="text-muted mb-0">Historique des données de votre véhicule</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success"></div>
      </div>

      <div class="row g-3" *ngIf="!loading">
        <div class="col-md-4" *ngFor="let log of logs.slice(0, 6)">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-info bg-opacity-10 text-info"><i class="bi bi-cpu me-1"></i>{{ log.sensorType }}</span>
                <span class="badge" [class]="log.status | statusBadge">{{ log.status }}</span>
              </div>
              <h4 class="fw-bold mb-0">{{ log.value }} <small class="text-muted fs-6">{{ log.unit }}</small></h4>
              <small class="text-muted">{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</small>
            </div>
          </div>
        </div>
        <div class="col-12" *ngIf="logs.length === 0">
          <div class="text-center py-5 text-muted">
            <i class="bi bi-journal-x fs-1 d-block mb-2"></i>Aucun log disponible
          </div>
        </div>
      </div>
    </div>
  `
})
export class MemberLogsComponent implements OnInit {
  logs: SensorLog[] = [];
  loading = true;

  constructor(private sensorLogService: SensorLogService) {}

  ngOnInit() {
    this.sensorLogService.getAllLogs().subscribe({
      next: d => { this.logs = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
