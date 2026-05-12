import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './health.component.html',
  styleUrl: './health.component.css'
})
export class AdminHealthComponent implements OnInit {
  status = '';
  loading = true;
  customers: any[] = [];
  allCdrs: any[] = [];
  selectedCustId: number | null = null;
  selectedCustomer: any = null;
  customerCdrs: any[] = [];

  services: { [key: number]: string } = {
    1: 'WiFi', 2: 'Climatiseur', 3: 'Siege Ergonomique',
    4: 'Machine a Cafe', 5: 'Glaciere Eau', 6: 'GPS', 7: 'Radio'
  };

  endpoints = [
    { method: 'GET',    path: '/api/customers',            desc: 'Liste customers' },
    { method: 'GET',    path: '/api/services',             desc: 'Catalogue services' },
    { method: 'GET',    path: '/api/cdr-logs',             desc: 'CDR Logs' },
    { method: 'GET',    path: '/api/invoices',             desc: 'Facturation' },
    { method: 'GET',    path: '/api/payments',             desc: 'Paiements' },
    { method: 'GET',    path: '/api/reviews',              desc: 'Avis services' },
    { method: 'GET',    path: '/api/users',                desc: 'Gestion users' },
    { method: 'GET',    path: '/api/user-logs',            desc: 'Logs connexions' },
    { method: 'GET',    path: '/api/team/supervisor/{id}', desc: 'Équipe supervisor' },
    { method: 'POST',   path: '/api/auth/login',           desc: 'Authentification' },
    { method: 'GET',    path: '/api/health',               desc: 'Health check' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.check();
    this.http.get<any[]>('/api/customers').subscribe({
      next: (data) => { this.customers = data; }
    });
    this.http.get<any[]>('/api/cdr-logs').subscribe({
      next: (data) => { this.allCdrs = data; }
    });
  }

  check() {
    this.loading = true;
    this.http.get('/api/health').subscribe({
      next: () => { this.status = 'UP'; this.loading = false; },
      error: () => { this.status = 'DOWN'; this.loading = false; }
    });
  }

onCustomerSelect() {
  if (!this.selectedCustId) {
    this.selectedCustomer = null;
    return;
  }
  const id = +this.selectedCustId!;
  this.selectedCustomer = this.customers.find(c => c.custId === id);
  this.customerCdrs = this.allCdrs.filter(c => c.custId === id);
}

  getTotalBrut(): number {
    return this.customerCdrs.reduce((sum, c) => sum + (c.rawAmount || 0), 0);
  }

  getDiscount(): number {
    if (!this.selectedCustomer) return 0;
    switch (this.selectedCustomer.clientType) {
      case 'SPORTIF': return 10;
      case 'ETUDIANT': return 15;
      default: return 0;
    }
  }

  getTotalNet(): number {
    const total = this.getTotalBrut();
    return total - (total * this.getDiscount() / 100);
  }

  getUsedServices(): any[] {
    const map: { [key: number]: number } = {};
    this.customerCdrs.forEach(cdr => {
      map[cdr.serviceId] = (map[cdr.serviceId] || 0) + (cdr.rawAmount || 0);
    });
    return Object.entries(map).map(([id, amount]) => ({
      serviceId: +id,
      serviceName: this.services[+id] || 'Service #' + id,
      totalAmount: amount
    }));
  }

  getServiceDuration(serviceId: number): number {
    return this.customerCdrs
      .filter(c => c.serviceId === serviceId)
      .reduce((sum, c) => sum + (c.durationMin || 0), 0);
  }

  getEstimatedTimeLeft(): any[] {
    if (!this.selectedCustomer) return [];
    const balance = this.selectedCustomer.balance || 0;
    const spent = this.getTotalNet();
    const remaining = balance - spent;

    return this.getUsedServices().map(s => {
      const avgPerMin = s.totalAmount / (this.getServiceDuration(s.serviceId) || 1);
      const minsLeft = avgPerMin > 0 ? remaining / avgPerMin : 0;
      const hoursLeft = Math.floor(minsLeft / 60);
      const minsRemainder = Math.floor(minsLeft % 60);
      return {
        serviceName: s.serviceName,
        timeLeft: hoursLeft > 0 ? `${hoursLeft}h ${minsRemainder}min` : `${minsRemainder} min`,
        amountSpent: s.totalAmount,
        percentage: Math.min(100, (s.totalAmount / (balance || 1)) * 100)
      };
    });
  }

  getTypeBadgeClass(clientType: string): string {
    switch (clientType) {
      case 'SPORTIF': return 'bg-success';
      case 'ETUDIANT': return 'bg-primary';
      case 'MINEUR': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  methodClass(m: string) {
    return {
      GET: 'bg-success', POST: 'bg-primary',
      PUT: 'bg-warning text-dark', DELETE: 'bg-danger'
    }[m] ?? 'bg-secondary';
  }
}
