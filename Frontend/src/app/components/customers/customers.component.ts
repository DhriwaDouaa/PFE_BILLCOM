import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4 px-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-info bg-opacity-10 p-3 rounded-3">
            <i class="bi bi-people-fill text-info fs-3"></i>
          </div>
          <div>
            <h2 class="fw-bold mb-0">Customers</h2>
            <p class="text-muted mb-0">{{ customers.length }} client(s) trouvé(s)</p>
          </div>
        </div>
        <button class="btn btn-info text-white px-4" (click)="openModal()">
          <i class="bi bi-plus-lg me-2"></i>Nouveau Client
        </button>
      </div>

      <!-- Alert -->
      <div *ngIf="message" class="alert" [class]="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i class="bi" [class]="messageType === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
        {{ message }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-info" role="status"></div>
        <p class="mt-2 text-muted">Chargement...</p>
      </div>

      <!-- Table -->
      <div class="card border-0 shadow-sm" *ngIf="!loading">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th class="px-4 py-3">#ID</th>
                  <th class="py-3">Nom</th>
                  <th class="py-3">Email</th>
                  <th class="py-3">Téléphone</th>
                  <th class="py-3">Balance</th>
                  <th class="py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of customers">
                  <td class="px-4 py-3"><span class="badge bg-secondary">{{ c.id }}</span></td>
                  <td class="py-3 fw-semibold">{{ c.name }}</td>
                  <td class="py-3 text-muted">{{ c.email }}</td>
                  <td class="py-3">{{ c.phone || '-' }}</td>
                  <td class="py-3">
                    <span class="badge bg-success bg-opacity-10 text-success fw-semibold">
                      {{ c.balance || 0 | number:'1.2-2' }} DT
                    </span>
                  </td>
                  <td class="py-3 text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" (click)="editCustomer(c)">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteCustomer(c.id!)">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="customers.length === 0">
                  <td colspan="6" class="text-center py-5 text-muted">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    Aucun customer trouvé
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
                <i class="bi bi-person-fill me-2 text-info"></i>
                {{ editMode ? 'Modifier' : 'Nouveau' }} Customer
              </h5>
              <button class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body px-4">
              <div class="mb-3">
                <label class="form-label fw-semibold">Nom *</label>
                <input type="text" class="form-control" [(ngModel)]="form.name" placeholder="Nom complet">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Email *</label>
                <input type="email" class="form-control" [(ngModel)]="form.email" placeholder="email@example.com">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Téléphone</label>
                <input type="text" class="form-control" [(ngModel)]="form.phone" placeholder="+216 XX XXX XXX">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">Balance (DT)</label>
                <input type="number" class="form-control" [(ngModel)]="form.balance" placeholder="0.00">
              </div>
            </div>
            <div class="modal-footer border-0">
              <button class="btn btn-secondary" (click)="closeModal()">Annuler</button>
              <button class="btn btn-info text-white px-4" (click)="saveCustomer()" [disabled]="saving">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ editMode ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  saving = false;
  showModal = false;
  editMode = false;
  message = '';
  messageType = 'success';
  editId: number | null = null;

  form: Customer = { name: '', email: '', phone: '', balance: 0 };

  constructor(private customerService: CustomerService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.customerService.getAll().subscribe({
      next: (data) => { this.customers = data; this.loading = false; },
      error: () => { this.loading = false; this.showMessage('Erreur chargement customers', 'error'); }
    });
  }

  openModal() {
    this.editMode = false;
    this.form = { name: '', email: '', phone: '', balance: 0 };
    this.showModal = true;
  }

  editCustomer(c: Customer) {
    this.editMode = true;
    this.editId = c.id!;
    this.form = { ...c };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; }

  saveCustomer() {
    if (!this.form.name || !this.form.email) return;
    this.saving = true;
    const obs = this.editMode
      ? this.customerService.update(this.editId!, this.form)
      : this.customerService.create(this.form);
    obs.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.load();
        this.showMessage(this.editMode ? 'Customer mis à jour !' : 'Customer créé !', 'success');
      },
      error: () => { this.saving = false; this.showMessage('Erreur lors de la sauvegarde', 'error'); }
    });
  }

  deleteCustomer(id: number) {
    if (!confirm('Supprimer ce customer ?')) return;
    this.customerService.delete(id).subscribe({
      next: () => { this.load(); this.showMessage('Customer supprimé !', 'success'); },
      error: () => this.showMessage('Erreur lors de la suppression', 'error')
    });
  }

  showMessage(msg: string, type: string) {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3000);
  }
}
