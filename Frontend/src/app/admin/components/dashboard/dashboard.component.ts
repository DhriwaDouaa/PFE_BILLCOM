import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('servicesChart') servicesChartRef!: ElementRef;
  @ViewChild('clientTypeChart') clientTypeChartRef!: ElementRef;
  @ViewChild('cdrChart') cdrChartRef!: ElementRef;

  customers: any[] = [];
  allCdrs: any[] = [];
  invoices: any[] = [];
  services: any[] = [];
  loading = true;
  totalRevenue = 0;
  pendingInvoices = 0;
  lowBalanceClients: any[] = [];
  pendingVerifications: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit() {
    Promise.all([
      this.http.get<any[]>('http://localhost:8080/api/customers').toPromise(),
      this.http.get<any[]>('http://localhost:8080/api/cdr-logs').toPromise(),
      this.http.get<any[]>('http://localhost:8080/api/invoices').toPromise(),
      this.http.get<any[]>('http://localhost:8080/api/services').toPromise()
    ]).then(([customers, cdrs, invoices, services]) => {
      this.customers = customers || [];
      this.allCdrs = cdrs || [];
      this.invoices = invoices || [];
      this.services = services || [];
      this.totalRevenue = this.allCdrs.reduce((sum, c) => sum + (c.rawAmount || 0), 0);
      this.pendingInvoices = this.invoices.filter(i => i.status === 'PENDING').length;
      this.lowBalanceClients = this.customers.filter(c => c.balance < 300);
      this.pendingVerifications = this.customers.filter(c => c.verificationStatus === 'PENDING');
      this.loading = false;
      setTimeout(() => this.initCharts(), 100);
    });
  }

  ngAfterViewInit() {}
  verifyCustomer(custId: number) {
    this.http.put(`http://localhost:8080/api/customers/${custId}`, {
      ...this.customers.find(c => c.custId === custId),
      verificationStatus: 'VERIFIED'
    }).subscribe({
      next: () => {
        const c = this.customers.find(c => c.custId === custId);
        if (c) c.verificationStatus = 'VERIFIED';
        this.pendingVerifications = this.customers.filter(c => c.verificationStatus === 'PENDING');
      }
    });
  }
  
  rejectCustomer(custId: number) {
    this.http.put(`http://localhost:8080/api/customers/${custId}`, {
      ...this.customers.find(c => c.custId === custId),
      verificationStatus: 'REJECTED'
    }).subscribe({
      next: () => {
        const c = this.customers.find(c => c.custId === custId);
        if (c) c.verificationStatus = 'REJECTED';
        this.pendingVerifications = this.customers.filter(c => c.verificationStatus === 'PENDING');
      }
    });
  }
  initCharts() {
    this.initRevenueChart();
    this.initServicesChart();
    this.initClientTypeChart();
    this.initCdrChart();
  }

  initRevenueChart() {
    const ctx = this.revenueChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Revenus (DT)',
          data: [8.5, 12.3, 21.2, 15.8, 18.4, 21.2],
          backgroundColor: 'rgba(0, 180, 216, 0.7)',
          borderColor: '#00b4d8',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  initServicesChart() {
    const ctx = this.servicesChartRef.nativeElement.getContext('2d');
    const serviceCount: { [key: string]: number } = {};
    this.allCdrs.forEach(cdr => {
      const name = this.getServiceName(cdr.serviceId);
      serviceCount[name] = (serviceCount[name] || 0) + 1;
    });

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(serviceCount),
        datasets: [{
          data: Object.values(serviceCount),
          backgroundColor: [
            '#00b4d8', '#0077b6', '#48cae4',
            '#90e0ef', '#ade8f4', '#caf0f8', '#f94144'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 11 } }
          }
        }
      }
    });
  }

  initClientTypeChart() {
    const ctx = this.clientTypeChartRef.nativeElement.getContext('2d');
    const types = ['STANDARD', 'SPORTIF', 'ETUDIANT', 'MINEUR'];
    const counts = types.map(t => this.customers.filter(c => c.clientType === t).length);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: types,
        datasets: [{
          label: 'Clients',
          data: counts,
          backgroundColor: ['#6c757d', '#198754', '#0d6efd', '#dc3545'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  initCdrChart() {
    const ctx = this.cdrChartRef.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['01/03', '02/03', '03/03', '04/03', '05/03', '06/03', '07/03'],
        datasets: [{
          label: 'CDR générés',
          data: [2, 3, 1, 2, 3, 2, 1],
          borderColor: '#00b4d8',
          backgroundColor: 'rgba(0, 180, 216, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00b4d8',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  getServiceName(serviceId: number): string {
    const services: { [key: number]: string } = {
      1: 'WiFi', 2: 'Climatiseur', 3: 'Siege Ergo',
      4: 'Cafe', 5: 'Glaciere', 6: 'GPS', 7: 'Radio'
    };
    return services[serviceId] || 'Service #' + serviceId;
  }

  getActiveCustomers(): number {
    return this.customers.filter(c => c.status === 'ACTIVE').length;
  }

  getRatedCdrs(): number {
    return this.allCdrs.filter(c => c.status === 'RATED').length;
  }

  getDiscount(clientType: string): number {
    switch (clientType) {
      case 'SPORTIF': return 10;
      case 'ETUDIANT': return 15;
      default: return 0;
    }
  }

  getCdrTotal(custId: number): number {
    return this.allCdrs
      .filter(c => c.custId === custId)
      .reduce((sum, c) => sum + (c.rawAmount || 0), 0);
  }

  getAmountAfterDiscount(custId: number, clientType: string): number {
    const total = this.getCdrTotal(custId);
    const discount = this.getDiscount(clientType);
    return total - (total * discount / 100);
  }
}
