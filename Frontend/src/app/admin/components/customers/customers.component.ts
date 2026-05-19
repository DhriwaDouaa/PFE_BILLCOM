import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css'
})
export class AdminCustomersComponent implements OnInit {
  customers: any[] = [];
  filteredCustomers: any[] = [];
  allCdrs: any[] = [];
  loading = true;
  searchTerm = '';
  selectedService = '';
  selectedType = '';
  selectedStatus = '';

  // Modal Create
  showCreateModal = false;
  createLoading = false;
  createError = '';
  newCustomer = {
    name: '',
    phone: '',
    age: null as number | null,
    clientType: 'STANDARD',
    balance: 0,
    status: 'EN_ATTENTE',
    verificationStatus: 'PENDING',
    email: '',
    password: ''
  };

  // Modal Edit
  showEditModal = false;
  editLoading = false;
  editError = '';
  editCustomer: any = {};

  // Modal Delete confirm
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;

  // Toast
  toastMsg = '';
  toastType = 'success';
  showToast = false;

  services: { [key: number]: string } = {
    1: 'WiFi', 2: 'Climatiseur', 3: 'Siege Ergonomique',
    4: 'Machine a Cafe', 5: 'Glaciere Eau', 6: 'GPS', 7: 'Radio'
  };

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.http.get<any[]>('/api/customers').subscribe({
      next: (data) => {
        this.customers = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.http.get<any[]>('/api/cdr-logs').subscribe({
      next: (data) => { this.allCdrs = data; }
    });
  }

  viewDetail(custId: number) {
    this.router.navigate(['/admin/customer-detail', custId]);
  }

  // ─── SEARCH ────────────────────────────────────────────────────────────────

  search() { this.applyFilters(); }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const serviceTerm = this.selectedService.toLowerCase().trim();
    const type = this.selectedType;
    const status = this.selectedStatus;

    this.filteredCustomers = this.customers.filter(c => {
      const matchName = c.name?.toLowerCase().includes(term);
      const matchCode = c.codeClient?.toLowerCase().includes(term);
      const matchPhone = c.phone?.toLowerCase().includes(term);
      const matchService = serviceTerm
        ? this.getCdrs(c.custId).some(cdr => {
          const serviceName = this.getServiceName(cdr.serviceId).toLowerCase();
          return serviceName.includes(serviceTerm);
        })
        : true;
      const matchType = type ? c.clientType === type : true;
      const matchStatus = status ? c.status === status : true;
      return (matchName || matchCode || matchPhone) && matchService && matchType && matchStatus;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedService = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.filteredCustomers = this.customers;
  }

  // ─── CREATE ────────────────────────────────────────────────────────────────

  openCreateModal() {
    this.newCustomer = {
      name: '',
      phone: '',
      age: null,
      clientType: 'STANDARD',
      balance: 0,
      status: 'EN_ATTENTE',
      verificationStatus: 'PENDING',
      email: '',
      password: ''
    };
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal() { this.showCreateModal = false; }

  submitCreate() {
    if (!this.newCustomer.name?.trim()) {
      this.createError = 'Le nom est obligatoire.';
      return;
    }
    if (!this.newCustomer.email?.trim()) {
      this.createError = "L'email est obligatoire.";
      return;
    }
    if (!this.newCustomer.password || this.newCustomer.password.length < 6) {
      this.createError = 'Mot de passe min. 6 caractères.';
      return;
    }
    this.createLoading = true;
    this.createError = '';

    const maxId = this.customers.length > 0
      ? Math.max(...this.customers.map(c => c.custId || 0))
      : 0;
    const newId = maxId + 1;
    const year = new Date().getFullYear();
    const codeClient = `CLT-${year}-${String(newId).padStart(3, '0')}`;

    const payload = {
      custId: newId,
      codeClient: codeClient,
      name: this.newCustomer.name,
      phone: this.newCustomer.phone,
      age: this.newCustomer.age,
      clientType: this.newCustomer.clientType,
      balance: this.newCustomer.balance,
      status: this.newCustomer.status,
      verificationStatus: this.newCustomer.verificationStatus
    };

    this.http.post<any>('/api/customers', payload).subscribe({
      next: (created) => {
        const userPayload = {
          custId: created.custId,
          email: this.newCustomer.email,
          password: this.newCustomer.password,
          role: 'MEMBER',
          username: this.newCustomer.name
        };
        this.http.post('/api/users', userPayload).subscribe({
          error: (err) => console.error('Erreur création user lié:', err)
        });

        this.customers.unshift(created);
        this.applyFilters();
        this.createLoading = false;
        this.showCreateModal = false;
        this.toast('Client créé avec succès !', 'success');
      },
      error: (err) => {
        this.createError = err?.error?.message || 'Erreur lors de la création.';
        this.createLoading = false;
      }
    });
  }

  // ─── EDIT ──────────────────────────────────────────────────────────────────

  openEditModal(c: any) {
    this.editCustomer = { ...c };
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal() { this.showEditModal = false; }

  submitEdit() {
    if (!this.editCustomer.name?.trim()) {
      this.editError = 'Le nom est obligatoire.';
      return;
    }
    this.editLoading = true;
    this.editError = '';
    this.http.put<any>(`/api/customers/${this.editCustomer.custId}`, this.editCustomer).subscribe({
      next: (updated) => {
        const idx = this.customers.findIndex(c => c.custId === updated.custId);
        if (idx !== -1) this.customers[idx] = updated;
        this.applyFilters();
        this.editLoading = false;
        this.showEditModal = false;
        this.toast('Client modifié avec succès !', 'success');
      },
      error: () => {
        this.editError = 'Erreur lors de la modification.';
        this.editLoading = false;
      }
    });
  }

  // ─── VALIDATE / REJECT ─────────────────────────────────────────────────────

  validateCustomer(c: any) {
    const payload = { ...c, status: 'VALIDE', verificationStatus: 'VERIFIED' };
    this.http.put<any>(`/api/customers/${c.custId}`, payload).subscribe({
      next: (updated) => {
        const idx = this.customers.findIndex(x => x.custId === c.custId);
        if (idx !== -1) this.customers[idx] = updated;
        this.applyFilters();
        this.toast(`Compte de ${c.name} validé !`, 'success');
      },
      error: () => this.toast('Erreur lors de la validation.', 'danger')
    });
  }

  rejectCustomer(c: any) {
    const payload = { ...c, status: 'REJETE', verificationStatus: 'REJECTED' };
    this.http.put<any>(`/api/customers/${c.custId}`, payload).subscribe({
      next: (updated) => {
        const idx = this.customers.findIndex(x => x.custId === c.custId);
        if (idx !== -1) this.customers[idx] = updated;
        this.applyFilters();
        this.toast(`Compte de ${c.name} rejeté.`, 'warning');
      },
      error: () => this.toast('Erreur lors du rejet.', 'danger')
    });
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────

  openDeleteModal(c: any) {
    this.deleteTarget = c;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.deleteLoading = true;
    this.http.delete(`/api/customers/${this.deleteTarget.custId}`).subscribe({
      next: () => {
        this.customers = this.customers.filter(c => c.custId !== this.deleteTarget.custId);
        this.applyFilters();
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.toast(`Client ${this.deleteTarget.name} supprimé.`, 'success');
        this.deleteTarget = null;
      },
      error: () => {
        this.deleteLoading = false;
        this.toast('Erreur lors de la suppression.', 'danger');
      }
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  toast(msg: string, type: string) {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  getCdrs(custId: number): any[] {
    return this.allCdrs.filter(c => c.custId === custId);
  }

  getCdrTotal(custId: number): number {
    return this.getCdrs(custId).reduce((sum, c) => sum + (c.rawAmount || 0), 0);
  }

  getServiceName(serviceId: number): string {
    return this.services[serviceId] || 'Service #' + serviceId;
  }

  getUsedServices(custId: number): number[] {
    const ids = this.getCdrs(custId).map(c => c.serviceId);
    return [...new Set(ids)];
  }

  getDiscount(clientType: string): number {
    switch (clientType) {
      case 'SPORTIF': return 10;
      case 'ETUDIANT': return 15;
      default: return 0;
    }
  }

  getAmountAfterDiscount(custId: number, clientType: string): number {
    const total = this.getCdrTotal(custId);
    const discount = this.getDiscount(clientType);
    return total - (total * discount / 100);
  }

  isWifiBlocked(clientType: string): boolean {
    return clientType === 'MINEUR';
  }

  getTypeBadgeClass(clientType: string): string {
    switch (clientType) {
      case 'SPORTIF': return 'bg-success';
      case 'ETUDIANT': return 'bg-primary';
      case 'MINEUR': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTypeIcon(clientType: string): string {
    switch (clientType) {
      case 'SPORTIF': return 'bi-trophy-fill';
      case 'ETUDIANT': return 'bi-mortarboard-fill';
      case 'MINEUR': return 'bi-shield-fill-exclamation';
      default: return 'bi-person-fill';
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'ACTIF': return 'bg-success';
      case 'VALIDE': return 'bg-info text-dark';
      case 'EN_ATTENTE': return 'bg-warning text-dark';
      case 'REJETE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'ACTIF': return 'ACTIF';
      case 'VALIDE': return 'VALIDÉ';
      case 'EN_ATTENTE': return 'EN ATTENTE';
      case 'REJETE': return 'REJETÉ';
      default: return status;
    }
  }

  getTotalBalance(): number {
    return this.filteredCustomers.reduce((sum, c) => sum + (c.balance || 0), 0);
  }

  getTotalBrut(): number {
    return this.filteredCustomers.reduce((sum, c) => sum + this.getCdrTotal(c.custId), 0);
  }

  getTotalNet(): number {
    return this.filteredCustomers.reduce((sum, c) =>
      sum + this.getAmountAfterDiscount(c.custId, c.clientType), 0);
  }

  countByStatus(status: string): number {
    return this.customers.filter(c => c.status === status).length;
  }
}