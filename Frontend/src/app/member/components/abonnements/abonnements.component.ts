import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-abonnements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './abonnements.component.html',
  styleUrl: './abonnements.component.css'
})
export class AbonnementsComponent implements OnInit {
  custId: number = parseInt(localStorage.getItem('custId') || '1');
  payments: any[] = [];
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.http.get<any[]>(`${environment.apiUrl}/payments/customer/${this.custId}`).subscribe({
      next: (data) => {
        this.payments = data.filter(p =>
          p.paymentMethod && p.paymentMethod.startsWith('SOUSCRIPTION')
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getPlanName(method: string): string {
    if (!method) return 'Inconnu';
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

  getTotalSpent(): number {
    return this.payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  }
}