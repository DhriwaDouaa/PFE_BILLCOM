import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cdr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cdr.component.html',
  styleUrl: './cdr.component.css'
})
export class CdrComponent implements OnInit {
  cdrs: any[] = [];
  loading = true;
  error = '';
  totalAmount = 0;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/cdr-logs').subscribe({
      next: (data) => {
        this.cdrs = data;
        this.totalAmount = data
          .filter(c => c.status === 'RATED')
          .reduce((sum, c) => sum + (c.rawAmount || 0), 0);
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur chargement CDR';
        this.loading = false;
      }
    });
  }

  getServiceName(serviceId: number): string {
    const services: { [key: number]: string } = {
  1: 'WiFi',
  2: 'Climatiseur',
  3: 'Siege Ergonomique',
  4: 'Machine a Cafe',
  5: 'Glaciere Eau',
  6: 'GPS',
  7: 'Radio'
};
    return services[serviceId] || 'Service #' + serviceId;
  }

  getRatedCdrs(): any[] {
    return this.cdrs.filter(c => c.status === 'RATED');
  }

  getPendingCdrs(): any[] {
    return this.cdrs.filter(c => c.status === 'PENDING');
  }
}