import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  services: any[] = [];
  filteredServices: any[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  selectedType = '';
  selectedBilling = '';
  viewMode: 'table' | 'cards' = 'cards';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('/api/services').subscribe({
      next: (data) => {
        this.services = data;
        this.filteredServices = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur chargement services';
        this.loading = false;
      }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const type = this.selectedType;
    const billing = this.selectedBilling;

    this.filteredServices = this.services.filter(s => {
      const matchName = s.serviceName?.toLowerCase().includes(term);
      const matchCode = s.codeService?.toLowerCase().includes(term);
      const matchDesc = s.description?.toLowerCase().includes(term);
      const matchType = type ? s.serviceType === type : true;
      const matchBilling = billing ? s.billingModel === billing : true;
      return (matchName || matchCode || matchDesc) && matchType && matchBilling;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedBilling = '';
    this.filteredServices = this.services;
  }

getServiceIcon(service: any): string {
  const name = service.serviceName?.toLowerCase() || '';
  if (name.includes('wifi')) return 'bi-wifi';
  if (name.includes('clim')) return 'bi-thermometer-sun';
  if (name.includes('siege')) return 'bi-person-workspace';
  if (name.includes('cafe')) return 'bi-cup-hot-fill';
  if (name.includes('glaciere') || name.includes('eau')) return 'bi-droplet-fill';
  if (name.includes('gps')) return 'bi-geo-alt-fill';
  if (name.includes('radio')) return 'bi-speaker-fill';
  return 'bi-gear-fill';
}

  getTypeColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'text-info';
      case 'COMFORT': return 'text-warning';
      case 'NAVIGATION': return 'text-success';
      case 'ENTERTAINMENT': return 'text-primary';
      default: return 'text-secondary';
    }
  }

  getTypeBgColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'bg-info';
      case 'COMFORT': return 'bg-warning';
      case 'NAVIGATION': return 'bg-success';
      case 'ENTERTAINMENT': return 'bg-primary';
      default: return 'bg-secondary';
    }
  }

  getBillingBadge(billingModel: string): string {
    switch (billingModel) {
      case 'FREEMIUM': return 'bg-info text-dark';
      case 'SESSION': return 'bg-warning text-dark';
      case 'EVENT': return 'bg-danger';
      case 'INCLUDED': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getBillingLabel(billingModel: string): string {
    switch (billingModel) {
      case 'FREEMIUM': return 'Freemium';
      case 'SESSION': return 'Par session';
      case 'EVENT': return 'Par événement';
      case 'INCLUDED': return 'Inclus';
      default: return billingModel;
    }
  }

  getActiveCount(): number {
    return this.services.filter(s => s.status === 'ACTIVE').length;
  }

  getIncludedCount(): number {
    return this.services.filter(s => s.billingModel === 'INCLUDED').length;
  }

  getServiceColor(serviceType: string): string {
  switch (serviceType) {
    case 'CONNECTIVITY': return 'text-info';
    case 'COMFORT': return 'text-warning';
    case 'NAVIGATION': return 'text-success';
    case 'ENTERTAINMENT': return 'text-primary';
    default: return 'text-secondary';
  }
}
}