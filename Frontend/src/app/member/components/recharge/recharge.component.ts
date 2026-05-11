import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recharge',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recharge.component.html',
  styleUrl: './recharge.component.css'
})
export class RechargeComponent implements OnInit {
  custId: number = parseInt(localStorage.getItem('custId') || '1');
  customerBalance: number = 0;
  activeTab: string = 'recharge';

  // Recharge par carte
  cardNumber = '';
  cardHolder = '';
  cardExpiry = '';
  cardCvv = '';
  rechargeAmount = 0;
  rechargeLoading = false;
  rechargeSuccess = false;
  rechargeError = '';

  // Souscription
  selectedPlan: any = null;
  subscriptionLoading = false;
  subscriptionSuccess = false;
  subscriptionError = '';

  plans = [
    {
      name: 'Basic',
      price: 50,
      color: 'info',
      icon: 'bi-star',
      features: ['50 TND de crédit', '5% de bonus', 'Services standards', 'Support email']
    },
    {
      name: 'Standard',
      price: 100,
      color: 'primary',
      icon: 'bi-star-fill',
      features: ['100 TND de crédit', '10% de bonus', 'Tous les services', 'Support prioritaire'],
      popular: true
    },
    {
      name: 'Premium',
      price: 200,
      color: 'warning',
      icon: 'bi-stars',
      features: ['200 TND de crédit', '20% de bonus', 'Services illimités', 'Support 24/7']
    }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBalance();
  }

  loadBalance() {
    this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
      next: (c) => this.customerBalance = c.balance ?? 0,
      error: () => this.customerBalance = 0
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.rechargeSuccess = false;
    this.subscriptionSuccess = false;
    this.rechargeError = '';
    this.subscriptionError = '';
  }

  formatCardNumber() {
    this.cardNumber = this.cardNumber.replace(/\D/g, '').substring(0, 16)
      .replace(/(.{4})/g, '$1 ').trim();
  }

  formatExpiry() {
    this.cardExpiry = this.cardExpiry.replace(/\D/g, '').substring(0, 4)
      .replace(/(.{2})/, '$1/');
  }

  getCardType(): string {
    const n = this.cardNumber.replace(/\s/g, '');
    if (n.startsWith('4')) return 'bi-credit-card-fill text-primary';
    if (n.startsWith('5')) return 'bi-credit-card-fill text-danger';
    return 'bi-credit-card';
  }

  recharger() {
    if (!this.cardNumber || !this.cardHolder || !this.cardExpiry || !this.cardCvv || !this.rechargeAmount) {
      this.rechargeError = 'Veuillez remplir tous les champs';
      return;
    }
    if (this.rechargeAmount <= 0) {
      this.rechargeError = 'Montant invalide';
      return;
    }

    this.rechargeLoading = true;
    this.rechargeError = '';

    const newBalance = this.customerBalance + this.rechargeAmount;

    // Save payment
    this.http.post(`${environment.apiUrl}/payments`, {
      custId: this.custId,
      amount: this.rechargeAmount,
      paymentMethod: 'CARTE_BANCAIRE',
      status: 'COMPLETED',
      paymentDate: new Date().toISOString()
    }).subscribe();

    // Update balance
    this.http.patch(`${environment.apiUrl}/customers/${this.custId}/balance`,
      { balance: newBalance }).subscribe({
        next: () => {
          this.customerBalance = newBalance;
          this.rechargeLoading = false;
          this.rechargeSuccess = true;
          this.cardNumber = '';
          this.cardHolder = '';
          this.cardExpiry = '';
          this.cardCvv = '';
          this.rechargeAmount = 0;
        
          // Update clientType to PREPAID
          this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
            next: (customer) => {
              this.http.put(`${environment.apiUrl}/customers/${this.custId}`, {
                ...customer,
                clientType: 'PREPAID'
              }).subscribe();
            }
          });
        },
        error: () => {
          this.rechargeLoading = false;
          this.rechargeError = 'Erreur lors de la recharge. Réessayez.';
        }
      });
  }

  selectPlan(plan: any) {
    this.selectedPlan = plan;
  }

  souscrire() {
    if (!this.selectedPlan) {
      this.subscriptionError = 'Veuillez choisir un plan';
      return;
    }

    this.subscriptionLoading = true;
    this.subscriptionError = '';

    const bonus = this.selectedPlan.price * (this.selectedPlan.name === 'Basic' ? 0.05 :
                  this.selectedPlan.name === 'Standard' ? 0.10 : 0.20);
    const totalCredit = this.selectedPlan.price + bonus;
    const newBalance = this.customerBalance + totalCredit;

    this.http.post(`${environment.apiUrl}/payments`, {
      custId: this.custId,
      amount: this.selectedPlan.price,
      paymentMethod: 'SOUSCRIPTION_' + this.selectedPlan.name.toUpperCase(),
      status: 'COMPLETED',
      paymentDate: new Date().toISOString()
    }).subscribe();
    this.http.patch(`${environment.apiUrl}/customers/${this.custId}/balance`,
      { balance: newBalance }).subscribe({
        next: () => {
          this.customerBalance = newBalance;
          this.subscriptionLoading = false;
          this.subscriptionSuccess = true;
          this.selectedPlan = null;
        
          // Update clientType to PREPAID
          this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
            next: (customer) => {
              this.http.put(`${environment.apiUrl}/customers/${this.custId}`, {
                ...customer,
                clientType: 'PREPAID'
              }).subscribe();
            }
          });
        },
        error: () => {
          this.subscriptionLoading = false;
          this.subscriptionError = 'Erreur lors de la souscription. Réessayez.';
        }
      });
  }
}