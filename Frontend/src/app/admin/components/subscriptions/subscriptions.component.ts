import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class AdminSubscriptionsComponent implements OnInit {

  subscriptions: any[] = [];
  filteredSubscriptions: any[] = [];
  customers: any[] = [];
  loading = true;
  searchTerm = '';
  selectedPlan = '';

  plans = [
    { name: 'BASIC',    label: 'Basic',    price: 50,  bonus: 5,  color: 'info',    icon: 'bi-star',      features: ['50 TND de crédit', '+5% de bonus', 'Services standards'] },
    { name: 'STANDARD', label: 'Standard', price: 100, bonus: 10, color: 'primary', icon: 'bi-star-fill', features: ['100 TND de crédit', '+10% de bonus', 'Tous les services'], popular: true },
    { name: 'PREMIUM',  label: 'Premium',  price: 200, bonus: 20, color: 'warning', icon: 'bi-stars',     features: ['200 TND de crédit', '+20% de bonus', 'Services illimités'] }
  ];

  // Modal créer
  showCreateModal = false;
  createLoading = false;
  createError = '';
  newSubscription = { custId: null as number | null, planName: 'BASIC' };

  // Modal modifier
  showEditModal = false;
  editLoading = false;
  editError = '';
  editSubscription: any = {};
  editPlanName = 'BASIC';

  // Modal supprimer
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;

  // Toast
  toastMsg = '';
  toastType = 'success';
  showToast = false;

  constructor(private http: HttpClient) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.http.get<any[]>('/api/payments').subscribe({
      next: (data) => {
        this.subscriptions = data
          .filter(p => p.paymentMethod?.startsWith('SOUSCRIPTION'))
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        this.applyFilters();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.http.get<any[]>('/api/customers').subscribe({
      next: (data) => { this.customers = data; }
    });
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    const plan = this.selectedPlan;
    this.filteredSubscriptions = this.subscriptions.filter(s => {
      const custName = this.getCustomerName(s.custId).toLowerCase();
      const matchTerm = custName.includes(term) || String(s.custId).includes(term);
      const matchPlan = plan ? s.paymentMethod === 'SOUSCRIPTION_' + plan : true;
      return matchTerm && matchPlan;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedPlan = '';
    this.filteredSubscriptions = this.subscriptions;
  }

  // ─── CREATE ────────────────────────────────────────────────

  openCreateModal() {
    this.newSubscription = { custId: null, planName: 'BASIC' };
    this.createError = '';
    this.showCreateModal = true;
  }

  closeCreateModal() { this.showCreateModal = false; }

  submitCreate() {
    if (!this.newSubscription.custId) {
      this.createError = 'Veuillez choisir un client.';
      return;
    }
    this.createLoading = true;
    this.createError = '';

    const plan = this.plans.find(p => p.name === this.newSubscription.planName)!;
    const bonus = plan.price * plan.bonus / 100;
    const totalCredit = plan.price + bonus;

    const paymentPayload = {
      custId: this.newSubscription.custId,
      amount: plan.price,
      paymentMethod: 'SOUSCRIPTION_' + plan.name,
      status: 'COMPLETED',
      paymentDate: new Date().toISOString()
    };

    this.http.post<any>('/api/payments', paymentPayload).subscribe({
      next: (created) => {
        this.http.get<any>(`/api/customers/${this.newSubscription.custId}`).subscribe({
          next: (customer) => {
            const newBalance = (customer.balance || 0) + totalCredit;
            this.http.patch(`/api/customers/${this.newSubscription.custId}/balance`,
              { balance: newBalance }).subscribe();
          }
        });
        this.subscriptions.unshift(created);
        this.applyFilters();
        this.createLoading = false;
        this.showCreateModal = false;
        this.toast(`Souscription ${plan.label} créée — +${totalCredit} DT crédités !`, 'success');
      },
      error: () => {
        this.createError = 'Erreur lors de la création.';
        this.createLoading = false;
      }
    });
  }

  // ─── EDIT ──────────────────────────────────────────────────

  openEditModal(s: any) {
    this.editSubscription = { ...s };
    this.editPlanName = this.getPlanLabel(s.paymentMethod);
    this.editError = '';
    this.showEditModal = true;
  }

  closeEditModal() { this.showEditModal = false; }

  submitEdit() {
    this.editLoading = true;
    this.editError = '';

    const plan = this.plans.find(p => p.name === this.editPlanName)!;

    const payload = {
      ...this.editSubscription,
      paymentMethod: 'SOUSCRIPTION_' + this.editPlanName,
      amount: plan.price,
      status: this.editSubscription.status,
      paymentDate: this.editSubscription.paymentDate
    };

    this.http.put<any>(`/api/payments/${this.editSubscription.paymentId}`, payload).subscribe({
      next: (updated) => {
        const idx = this.subscriptions.findIndex(s => s.paymentId === updated.paymentId);
        if (idx !== -1) this.subscriptions[idx] = updated;
        this.applyFilters();
        this.editLoading = false;
        this.showEditModal = false;
        this.toast('Souscription modifiée avec succès !', 'success');
      },
      error: () => {
        this.editError = 'Erreur lors de la modification.';
        this.editLoading = false;
      }
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
    this.http.delete(`/api/payments/${this.deleteTarget.paymentId}`).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(s => s.paymentId !== this.deleteTarget.paymentId);
        this.applyFilters();
        this.deleteLoading = false;
        this.showDeleteModal = false;
        this.toast('Souscription supprimée.', 'success');
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
    setTimeout(() => this.showToast = false, 4000);
  }

  getCustomerName(custId: number): string {
    const c = this.customers.find(x => x.custId === custId);
    return c ? c.name : 'Client #' + custId;
  }

  getPlanLabel(method: string): string {
    if (!method) return '-';
    return method.replace('SOUSCRIPTION_', '');
  }

  getPlanColor(method: string): string {
    if (method?.includes('BASIC')) return 'info';
    if (method?.includes('STANDARD')) return 'primary';
    if (method?.includes('PREMIUM')) return 'warning';
    return 'secondary';
  }

  getPlanIcon(method: string): string {
    if (method?.includes('BASIC')) return 'bi-star';
    if (method?.includes('STANDARD')) return 'bi-star-fill';
    if (method?.includes('PREMIUM')) return 'bi-stars';
    return 'bi-star';
  }

  getBonus(method: string): number {
    if (method?.includes('BASIC')) return 5;
    if (method?.includes('STANDARD')) return 10;
    if (method?.includes('PREMIUM')) return 20;
    return 0;
  }

  countByPlan(planName: string): number {
    return this.subscriptions.filter(s => s.paymentMethod === 'SOUSCRIPTION_' + planName).length;
  }

  getTotalRevenue(): number {
    return this.subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);
  }

  getPlanPrice(planName: string): number {
    return this.plans.find(p => p.name === planName)?.price || 0;
  }

  getPlanBonus(planName: string): number {
    return this.plans.find(p => p.name === planName)?.bonus || 0;
  }
}
