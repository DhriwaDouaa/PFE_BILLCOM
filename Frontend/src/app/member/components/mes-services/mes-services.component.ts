import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mes-services',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-services.component.html',
  styleUrl: './mes-services.component.css'
})
export class MesServicesComponent implements OnInit {
  services: any[] = [];
  customer: any = null;
  reviews: any[] = [];
  loading = true;
  custId = parseInt(localStorage.getItem('custId') || '1');

  selectedServiceId: number | null = null;
  newRating = 0;
  hoverRating = 0;
  newComment = '';
  submitting = false;
  successMsg = '';
  errorMsg = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any>(`/api/customers/${this.custId}`).subscribe({
      next: (data) => { this.customer = data; }
    });
    this.http.get<any[]>('/api/services').subscribe({
      next: (data) => { this.services = data; this.loading = false; }
    });
    this.http.get<any[]>('/api/reviews').subscribe({
      next: (data) => { this.reviews = data; }
    });
  }

  getServiceReviews(serviceId: number): any[] {
    return this.reviews.filter(r => r.serviceId === serviceId);
  }

  getAverageRating(serviceId: number): number {
    const r = this.getServiceReviews(serviceId);
    if (r.length === 0) return 0;
    return r.reduce((sum, rev) => sum + rev.rating, 0) / r.length;
  }

  getStars(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  hasAlreadyReviewed(serviceId: number): boolean {
    return this.reviews.some(r => r.serviceId === serviceId && r.custId === this.custId);
  }

  openReviewForm(serviceId: number) {
    this.selectedServiceId = serviceId;
    this.newRating = 0;
    this.newComment = '';
    this.successMsg = '';
    this.errorMsg = '';
  }

  closeReviewForm() {
    this.selectedServiceId = null;
    this.newRating = 0;
    this.hoverRating = 0;
    this.newComment = '';
  }

  setRating(star: number) { this.newRating = star; }
  setHover(star: number) { this.hoverRating = star; }
  clearHover() { this.hoverRating = 0; }

  submitReview() {
    if (!this.newRating || !this.newComment.trim()) {
      this.errorMsg = 'Veuillez donner une note et un commentaire !';
      return;
    }
    this.submitting = true;
    const review = {
      serviceId: this.selectedServiceId,
      custId: this.custId,
      rating: this.newRating,
      comment: this.newComment.trim()
    };
    this.http.post<any>('/api/reviews', review).subscribe({
      next: (data) => {
        this.reviews.push(data);
        this.submitting = false;
        this.successMsg = 'Avis soumis avec succès ! Merci 🎉';
        setTimeout(() => this.closeReviewForm(), 2000);
      },
      error: () => { this.submitting = false; this.errorMsg = 'Erreur lors de la soumission'; }
    });
  }

  deleteReview(reviewId: number) {
    if (!confirm('Supprimer cet avis ?')) return;
    this.http.delete(`/api/reviews/${reviewId}`).subscribe({
      next: () => { this.reviews = this.reviews.filter(r => r.reviewId !== reviewId); },
      error: () => alert('Erreur lors de la suppression')
    });
  }

  getActiveStarClass(serviceId: number, star: number): boolean {
    return star <= Math.round(this.getAverageRating(serviceId));
  }

  getDiscount(): number {
    if (!this.customer) return 0;
    switch (this.customer.clientType) {
      case 'SPORTIF': return 10;
      case 'ETUDIANT': return 15;
      default: return 0;
    }
  }

  getPriceAfterDiscount(price: number): number {
    const discount = this.getDiscount();
    return price - (price * discount / 100);
  }

  isWifiBlocked(): boolean {
    return this.customer?.clientType === 'MINEUR';
  }

  isServiceBlocked(service: any): boolean {
    return service.serviceType === 'CONNECTIVITY' && this.isWifiBlocked();
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

  getServiceColor(serviceType: string): string {
    switch (serviceType) {
      case 'CONNECTIVITY': return 'text-info';
      case 'COMFORT': return 'text-warning';
      case 'NAVIGATION': return 'text-success';
      case 'ENTERTAINMENT': return 'text-primary';
      default: return 'text-secondary';
    }
  }

  getBillingLabel(billingModel: string): string {
    switch (billingModel) {
      case 'FREEMIUM': return 'Gratuit jusqu\'à 500MB';
      case 'SESSION': return 'Par minute';
      case 'EVENT': return 'Par utilisation';
      case 'INCLUDED': return 'Inclus gratuit';
      default: return billingModel;
    }
  }
}