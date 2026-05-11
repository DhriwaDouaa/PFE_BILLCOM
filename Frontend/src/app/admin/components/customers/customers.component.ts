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

  services: { [key: number]: string } = {
    1: 'WiFi', 2: 'Climatiseur', 3: 'Siege Ergonomique',
    4: 'Machine a Cafe', 5: 'Glaciere Eau', 6: 'GPS', 7: 'Radio'
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/customers').subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.loading = false;
      }
    });
    this.http.get<any[]>('http://localhost:8080/api/cdr-logs').subscribe({
      next: (data) => { this.allCdrs = data; }
    });
  }

  viewDetail(custId: number) {
    this.router.navigate(['/admin/customer-detail', custId]);
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const serviceTerm = this.selectedService.toLowerCase().trim();
    const type = this.selectedType;

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
      return (matchName || matchCode || matchPhone) && matchService && matchType;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedService = '';
    this.selectedType = '';
    this.filteredCustomers = this.customers;
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
}