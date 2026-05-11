import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SensorLogService } from '../../services/sensor-log.service';
import { SensorLog } from '../../models/sensor-log.model';

@Component({
  selector: 'app-sensor-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4 px-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-success bg-opacity-10 p-3 rounded-3">
            <i class="bi bi-activity text-success fs-3"></i>
          </div>
          <div>
            <h2 class="fw-bold mb-0">Sensor Logs</h2>
            <p class="text-muted mb-0">{{ logs.length }} entrée(s)</p>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary" (click)="load()">
            <i class="bi bi-arrow-clockwise me-1"></i>Rafraîchir
          </button>
          <button class="btn btn-success text-white px-4" (click)="openModal()">
            <i class="bi bi-plus-lg me-2"></i>Nouveau Log
          </button>
        </div>
      </div>

      <div *ngIf="message" class="alert" [class]="messageType === 'success' ? 'alert-success' : 'alert-danger'">
        {{ message }}
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-success" role="status"></div>
        <p class="mt-2 text-muted">Chargement...</p>
      </div>

      <div class="card border-0 shadow-sm" *ngIf="!loading">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th class="px-4 py-3">#ID</th>
                  <th class="py-3">Type Capteur</th>
                  <th class="py-3">Valeur</th>
                  <th class="py-3">Unité</th>
                  <th class="py-3">Status</th>
                  <th class="py-3">Timestamp</th>
                  <th class="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of logs">
                  <td class="px-4 py-3"><span class="badge bg-secondary">{{ log.id }}</span></td>
                  <td class="py-3">
                    <span class="badge bg-info bg-opacity-10 text-info fw-semibold">
                      <i class="bi bi-cpu me-1"></i>{{ log.sensorType }}
                    </span>
                  </td>
                  <td class="py-3 fw-bold">{{ log.value }}</td>
                  <td class="py-3 text-muted">{{ log.unit || '-' }}</td>
                  <td class="py-3">
                    <span class="badge" [class]="getStatusClass(log.status)">
                      {{ log.status || 'N/A' }}
                    </span>
                  </td>
                  <td class="py-3 text-muted small">{{ log.timestamp | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td class="py-3 text-center">
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteLog(log.id!)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="logs.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-activity fs-1 d-block mb-2"></i>
                    Aucun log de capteur trouvé
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" style="background:rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">
                <i class="bi bi-activity me-2 text-success"></i>Nouveau Sensor Log
              </h5>
              <button class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body px-4">
              <div class="mb-3">
                <label class="form-label fw-semibold">Type de Capteur *</label>
                <select class="form-select" [(ngModel)]="form.sensorType">
                  <option value="">Sélectionner...</option>
                  <option value="TEMPERATURE">Température</option>
                  <option value="SPEED">Vitesse</option>
                  <option value="FUEL">Carburant</option>
                  <option value="GPS">GPS</option>
                  <option value="ENGINE">Moteur</option>
                  <option value="BRAKE">Frein</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Valeur *</label>
                <input type="number" class="form-control" [(ngModel)]="form.value" placeholder="0">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Unité</label>
                <input type="text" class="form-control" [(ngModel)]="form.unit" placeholder="ex: °C, km/h, %">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Status</label>
                <select class="form-select" [(ngModel)]="form.status">
                  <option value="NORMAL">Normal</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div class="modal-footer border-0">
              <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button class="btn btn-success text-white px-4" (click)="saveLog()" [disabled]="saving">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                Créer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SensorLogsComponent implements OnInit {
  logs: SensorLog[] = [];
  loading = true;
  saving = false;
  showModal = false;
  message = '';
  messageType = 'success';

  form: SensorLog = { sensorType: '', value: 0, unit: '', status: 'NORMAL' };

  constructor(private sensorLogService: SensorLogService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.sensorLogService.getAll().subscribe({
      next: (data) => { this.logs = data; this.loading = false; },
      error: () => { this.loading = false; this.showMessage('Erreur chargement logs', 'error'); }
    });
  }

  openModal() {
    this.form = { sensorType: '', value: 0, unit: '', status: 'NORMAL' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveLog() {
    if (!this.form.sensorType) return;
    this.saving = true;
    this.sensorLogService.create(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.load();
        this.showMessage('Log créé avec succès !', 'success');
      },
      error: () => { this.saving = false; this.showMessage('Erreur lors de la création', 'error'); }
    });
  }

  deleteLog(id: number) {
    if (!confirm('Supprimer ce log ?')) return;
    this.sensorLogService.delete(id).subscribe({
      next: () => { this.load(); this.showMessage('Log supprimé !', 'success'); },
      error: () => this.showMessage('Erreur lors de la suppression', 'error')
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'NORMAL': return 'bg-success';
      case 'WARNING': return 'bg-warning text-dark';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  showMessage(msg: string, type: string) {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }
}
