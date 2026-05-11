import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.css'
})
export class FacturesComponent implements OnInit {
  custId: number = parseInt(localStorage.getItem('custId') || '1');
  invoices: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.http.get<any[]>(`${environment.apiUrl}/invoices/customer/${this.custId}`).subscribe({
      next: (data) => {
        this.invoices = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PAID': return 'success';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  getTotalPaid(): number {
    return this.invoices
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + (i.totalAmount ?? 0), 0);
  }

  getPendingCount(): number {
    return this.invoices.filter(i => i.status === 'PENDING').length;
  }
}