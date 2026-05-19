import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedType = '';
  selectedBilling = '';
  viewMode: 'table' | 'cards' = 'cards';

  // Modal Create
  showCreateModal = false;
  createLoading = false;
  createError = '';
  newService = {
    serviceName: '',
    serviceType: 'COMFORT',
    billingModel: 'SESSION',
    unitPrice: 0,
    unit: 'MIN',
    status: 'ACTIVE',
    codeService: '',
    description: ''
  };

  // Modal Edit
  showEditModal = false;
  editLoading = false;
  editError = '';
  editService: any = {};

  // Modal Delete
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;

  // Toast
  toastMsg = '';
  toastType = 'success';
  showToast = false;

  constructor(private http: HttpClient) { }

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.http.get<any[]>('/api/services').subscribe({
      next: (data) => {
        this.services = data;
        this.filteredServices = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur chargement services';
        this.loading = false;
      }
    });
  }

  // ─── SEARCH ────────────────────────────────────────────────

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const type = this.selectedType;
    const billing = this.selectedBilling;
    this.filteredServices = this.services.filter(s => {
      const matchName = s.serviceName?.toLowerCase().includes(term);
      const matchCode = s.codeService?.toLowerCase().includes(term);
      const matchDesc = s.description?.toLowerCase().includes(term);
      const matchType = type ? s.serviceType === type : true;
      const matchBilling = billing ? s.billingModel === billing : true;
      return (matchName || matchCode || matchDesc) && matchType && matchBilling;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedBilling = '';
    this.filteredServices = this.services;
  }

  // ─── CREATE ────────────────────────────────────────────────

  openCreateModal() {
    this.newService = {
      serviceName: '',
      serviceType: 'COMFORT',
      billingModel: 'SESSION',
      unitPrice: 0,
      unit: 'MIN',
      status: 'ACTIVE',
      codeService: '',
      description: ''
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal() { this.showCreateModal = false; }

  submitCreate() {
    if (!this.newService.serviceName.trim()) {
      this.createError = 'Le nom du service est obligatoire.';
      return;
    }
    this.createLoading = true;
    this.createError = '';
    this.http.post<any>('/api/services', this.newService).subscribe({
      next: (created) => {
        this.services.unshift(created);
        this.filteredServices = this.services;
        this.createLoading = false;
        this.showCreateModal = false;
        this.toast('Service créé avec succès !', 'success');
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Erreur lors de la création.';
        this.createLoading = false;
      }
    });
  }

  // ─── EDIT ──────────────────────────────────────────────────

  openEditModal(s: any) {
    this.editService = { ...s };
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal() { this.showEditModal = false; }

  submitEdit() {
    if (!this.editService.serviceName?.trim()) {
      this.editError = 'Le nom est obligatoire.';
      return;
    }
    this.editLoading = true;
    this.editError = '';
    this.http.put<any>(`/api/services/${this.editService.serviceId}`, this.editService).subscribe({
      next: (updated) => {
        const idx = this.services.findIndex(s => s.serviceId === updated.serviceId);
        if (idx !== -1) this.services[idx] = updated;
        this.filteredServices = this.services;
        this.editLoading = false;
        this.showEditModal = false;
        this.toast('Service modifié avec succès !', 'success');
      },
      error: () => {
        this.editError = 'Erreur lors de la modification.';
        this.editLoading = false;
      }
    });
  }

  // ─── TOGGLE ACTIVE/INACTIVE ────────────────────────────────

  toggleStatus(s: any) {
    const newStatus = s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const payload = { ...s, status: newStatus };
    this.http.put<any>(`/api/services/${s.serviceId}`, payload).subscribe({
      next: (updated) => {
        const idx = this.services.findIndex(x => x.serviceId === s.serviceId);
        if (idx !== -1) this.services[idx] = updated;
        this.filteredServices = [...this.services];
        const label = newStatus === 'ACTIVE' ? 'activé' : 'désactivé';
        this.toast(`Service ${s.serviceName} ${label}.`, newStatus === 'ACTIVE' ? 'success' : 'warning');
      },
      error: () => this.toast('Erreur lors du changement de statut.', 'danger')
    });
  }

  // ─── DELETE ────────────────────────────────────────────────

  openDeleteModal(s: any) {
    this.deleteTarget = s;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.deleteLoading = true;
    this.http.delete(`/api/services/${this.deleteTarget.serviceId}`).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.serviceId !== this.deleteTarget.serviceId);
        this.filteredServices = this.services;
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.toast(`Service ${this.deleteTarget.serviceName} supprimé.`, 'success');
        this.deleteTarget = null;
      },
      error: () => {
        this.deleteLoading = false;
        this.toast('Erreur lors de la suppression.', 'danger');
      }
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────

  toast(msg: string, type: string) {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  getServiceIcon(service: any): string {
    const name = service.serviceName?.toLowerCase() || '';
    if (name.includes('wifi')) return 'bi-wifi';
    if (name.includes('clim')) return 'bi-thermometer-sun';
    if (name.includes('siege')) return 'bi-person-workspace';
    if (name.includes('cafe')) return 'bi-cup-hot-fill';
    if (name.includes('glaciere') || name.includes('eau')) return 'bi-droplet-fill';
    if (name.includes('gps')) return 'bi-geo-alt-fill';
    if (name.includes('radio')) return 'bi-speaker-fill';
    return 'bi-gear-fill';
  }

  getTypeColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'text-info';
      case 'COMFORT': return 'text-warning';
      case 'NAVIGATION': return 'text-success';
      case 'ENTERTAINMENT': return 'text-primary';
      default: return 'text-secondary';
    }
  }

  getTypeBgColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'bg-info';
      case 'COMFORT': return 'bg-warning';
      case 'NAVIGATION': return 'bg-success';
      case 'ENTERTAINMENT': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getBillingBadge(billingModel: string): string {
    switch (billingModel) {
      case 'FREEMIUM': return 'bg-info text-dark';
      case 'SESSION': return 'bg-warning text-dark';
      case 'EVENT': return 'bg-danger';
      case 'INCLUDED': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getBillingLabel(billingModel: string): string {
    switch (billingModel) {
      case 'FREEMIUM': return 'Freemium';
      case 'SESSION': return 'Par session';
      case 'EVENT': return 'Par événement';
      case 'INCLUDED': return 'Inclus';
      default: return billingModel;
    }
  }

  getActiveCount(): number {
    return this.services.filter(s => s.status === 'ACTIVE').length;
  }

  getIncludedCount(): number {
    return this.services.filter(s => s.billingModel === 'INCLUDED').length;
  }

  getServiceColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'text-info';
      case 'COMFORT': return 'text-warning';
      case 'NAVIGATION': return 'text-success';
      case 'ENTERTAINMENT': return 'text-primary';
      default: return 'text-secondary';
    }
  }
}