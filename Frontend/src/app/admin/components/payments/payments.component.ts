import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  customers: any[] = [];
  loading = true;
  searchTerm = '';
  selectedStatus = '';
  selectedMethod = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/payments').subscribe({
      next: (data) => {
        this.payments = data;
        this.filteredPayments = data;
        this.loading = false;
      }
    });

    this.http.get<any[]>('http://localhost:8080/api/customers').subscribe({
      next: (data) => { this.customers = data; }
    });
  }

  getCustomerName(custId: number): string {
    const c = this.customers.find(c => c.custId === custId);
    return c ? c.name : 'Client #' + custId;
  }

  getCustomerCode(custId: number): string {
    const c = this.customers.find(c => c.custId === custId);
    return c ? c.codeClient : '-';
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const status = this.selectedStatus;
    const method = this.selectedMethod;

    this.filteredPayments = this.payments.filter(p => {
      const matchName = this.getCustomerName(p.custId).toLowerCase().includes(term);
      const matchId = p.paymentId?.toString().includes(term);
      const matchStatus = status ? p.status === status : true;
      const matchMethod = method ? p.paymentMethod === method : true;
      return (matchName || matchId) && matchStatus && matchMethod;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedMethod = '';
    this.filteredPayments = this.payments;
  }

  getTotalAmount(): number {
    return this.filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  getCompletedCount(): number {
    return this.payments.filter(p => p.status === 'COMPLETED').length;
  }

  getPendingCount(): number {
    return this.payments.filter(p => p.status === 'PENDING').length;
  }

  getCompletedAmount(): number {
    return this.payments
      .filter(p => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  getMethodIcon(method: string): string {
    switch (method) {
      case 'CARTE': return 'bi-credit-card-fill';
      case 'VIREMENT': return 'bi-bank';
      case 'ESPECES': return 'bi-cash-coin';
      default: return 'bi-wallet-fill';
    }
  }

  getMethodColor(method: string): string {
    switch (method) {
      case 'CARTE': return 'bg-info';
      case 'VIREMENT': return 'bg-primary';
      case 'ESPECES': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}