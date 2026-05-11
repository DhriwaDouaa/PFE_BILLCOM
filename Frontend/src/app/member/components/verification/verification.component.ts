import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent implements OnInit {
  custId: number = parseInt(localStorage.getItem('custId') || '1');
  customer: any = null;
  loading = true;

  selectedFile: File | null = null;
  filePreview: string | null = null;
  uploadLoading = false;
  uploadSuccess = false;
  uploadError = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomer();
  }

  loadCustomer() {
    this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
      next: (data) => {
        this.customer = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getTypeLabel(): string {
    const types: { [key: string]: string } = {
      'ETUDIANT': 'Étudiant',
      'SPORTIF': 'Sportif',
      'MINEUR': 'Mineur',
      'STANDARD': 'Standard'
    };
    return types[this.customer?.clientType] || 'Standard';
  }

  getTypeIcon(): string {
    const icons: { [key: string]: string } = {
      'ETUDIANT': 'bi-mortarboard-fill',
      'SPORTIF': 'bi-trophy-fill',
      'MINEUR': 'bi-person-hearts',
      'STANDARD': 'bi-person-fill'
    };
    return icons[this.customer?.clientType] || 'bi-person-fill';
  }

  getDocumentLabel(): string {
    const labels: { [key: string]: string } = {
      'ETUDIANT': 'Carte étudiante ou certificat de scolarité',
      'SPORTIF': 'Carte de membre ou attestation de la salle de sport',
      'MINEUR': 'Carte d\'identité des parents ou tuteur légal',
      'STANDARD': 'Carte d\'identité nationale'
    };
    return labels[this.customer?.clientType] || 'Document d\'identité';
  }

  getStatusColor(): string {
    switch(this.customer?.verificationStatus) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'secondary';
    }
  }

  getStatusLabel(): string {
    switch(this.customer?.verificationStatus) {
      case 'VERIFIED': return 'Vérifié';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING': return 'En attente';
      default: return 'Non soumis';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.uploadError = 'Le fichier ne doit pas dépasser 5MB';
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.uploadError = 'Format non supporté. Utilisez JPG, PNG ou PDF';
      return;
    }

    this.selectedFile = file;
    this.uploadError = '';

    // Preview pour images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }
  }

  submitVerification() {
    if (!this.selectedFile) {
      this.uploadError = 'Veuillez sélectionner un document';
      return;
    }

    this.uploadLoading = true;
    this.uploadError = '';

    // Convert to base64 w save fel backend
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      this.http.put(`${environment.apiUrl}/customers/${this.custId}`, {
        ...this.customer,
        verificationStatus: 'PENDING',
        verificationDoc: base64.substring(0, 499) // max 499 chars
      }).subscribe({
        next: () => {
          this.uploadLoading = false;
          this.uploadSuccess = true;
          this.customer.verificationStatus = 'PENDING';
        },
        error: () => {
          this.uploadLoading = false;
          this.uploadError = 'Erreur lors de l\'envoi. Réessayez.';
        }
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }
}