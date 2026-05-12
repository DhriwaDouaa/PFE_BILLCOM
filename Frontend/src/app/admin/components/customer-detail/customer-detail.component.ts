import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.css'
})
export class CustomerDetailComponent implements OnInit {
  customer: any = null;
  cdrs: any[] = [];
  invoices: any[] = [];
  ecoScores: any[] = [];
  contract: any = null;
  loading = true;
  custId: number = 0;

  services: { [key: number]: string } = {
    1: 'WiFi', 2: 'Climatiseur', 3: 'Siege Ergonomique',
    4: 'Machine a Cafe', 5: 'Glaciere Eau', 6: 'GPS', 7: 'Radio'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.custId = parseInt(this.route.snapshot.paramMap.get('id') || '0');
    this.loadData();
  }

  loadData() {
    this.loading = true;

    this.http.get<any>(`/api/customers/${this.custId}`).subscribe({
      next: (data) => { this.customer = data; }
    });

    this.http.get<any[]>(`/api/cdr-logs/customer/${this.custId}`).subscribe({
      next: (data) => { this.cdrs = data; }
    });

    this.http.get<any[]>(`/api/invoices/customer/${this.custId}`).subscribe({
      next: (data) => { this.invoices = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  goBack() {
    this.router.navigate(['/admin/customers']);
  }

  getDiscount(): number {
    if (!this.customer) return 0;
    switch (this.customer.clientType) {
      case 'SPORTIF': return 10;
      case 'ETUDIANT': return 15;
      default: return 0;
    }
  }

  getTotalBrut(): number {
    return this.cdrs.reduce((sum, c) => sum + (c.rawAmount || 0), 0);
  }

  getTotalNet(): number {
    const total = this.getTotalBrut();
    const discount = this.getDiscount();
    return total - (total * discount / 100);
  }

  getTotalEco(): number {
    return this.ecoScores.reduce((sum, e) => sum + (e.pointsEarned || 0), 0);
  }

  getServiceName(serviceId: number): string {
    return this.services[serviceId] || 'Service #' + serviceId;
  }

  getTypeBadgeClass(): string {
    if (!this.customer) return 'bg-secondary';
    switch (this.customer.clientType) {
      case 'SPORTIF': return 'bg-success';
      case 'ETUDIANT': return 'bg-primary';
      case 'MINEUR': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTypeIcon(): string {
    if (!this.customer) return 'bi-person-fill';
    switch (this.customer.clientType) {
      case 'SPORTIF': return 'bi-trophy-fill';
      case 'ETUDIANT': return 'bi-mortarboard-fill';
      case 'MINEUR': return 'bi-shield-fill-exclamation';
      default: return 'bi-person-fill';
    }
  }

  getContractType(): string {
    if (!this.customer) return '-';
    return this.customer.custId % 2 === 0 ? 'POSTPAID' : 'PREPAID';
  }
}
