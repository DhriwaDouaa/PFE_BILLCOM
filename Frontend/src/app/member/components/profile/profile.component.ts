import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MemberService } from '../../services/member.service';
import { CdrService } from '../../services/cdr.service';
import { Member } from '../../models/member.model';
import { environment } from '../../../../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class MemberProfileComponent implements OnInit {
  profile: Member | null = null;
  cdrs: any[] = [];
  loading = true;
  loadingCdr = true;
  totalAmount = 0;

  editMode = false;
  editName = '';
  editPhone = '';
  editClientType = '';
  editLoading = false;
  editSuccess = false;
  editError = '';

  selectedFile: File | null = null;
  filePreview: string | null = null;

  clientTypes = [
    { value: 'STANDARD', label: 'Standard', icon: 'bi-person-fill' },
    { value: 'ETUDIANT', label: 'Étudiant', icon: 'bi-mortarboard-fill' },
    { value: 'SPORTIF', label: 'Sportif', icon: 'bi-trophy-fill' },
    { value: 'MINEUR', label: 'Mineur', icon: 'bi-person-hearts' }
  ];

  constructor(
    private memberService: MemberService,
    private cdrService: CdrService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const custId = parseInt(localStorage.getItem('custId') || '1');
    this.memberService.getProfile().subscribe({
      next: (data) => { this.profile = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.cdrService.getByCustId(custId).subscribe({
      next: (data) => {
        this.cdrs = data;
        this.totalAmount = data.reduce((sum: number, cdr: any) => sum + (cdr.rawAmount || 0), 0);
        this.loadingCdr = false;
      },
      error: () => { this.loadingCdr = false; }
    });
  }

  toggleEdit() {
    this.editMode = !this.editMode;
    if (this.editMode && this.profile) {
      this.editName = this.profile.name || '';
      this.editPhone = (this.profile as any).phone || '';
      this.editClientType = (this.profile as any).clientType || 'STANDARD';
    }
    this.editSuccess = false;
    this.editError = '';
    this.selectedFile = null;
    this.filePreview = null;
  }

  selectClientType(type: string) {
    this.editClientType = type;
    this.selectedFile = null;
    this.filePreview = null;
  }

  getDocumentRequired(): string {
    const docs: { [key: string]: string } = {
      'ETUDIANT': 'Carte étudiante ou certificat de scolarité',
      'SPORTIF': 'Carte de membre ou attestation de la salle de sport',
      'MINEUR': 'Carte d\'identité des parents ou tuteur légal'
    };
    return docs[this.editClientType] || '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.editError = 'Le fichier ne doit pas dépasser 5MB';
      return;
    }
    this.selectedFile = file;
    this.editError = '';
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => this.filePreview = e.target?.result as string;
      reader.readAsDataURL(file);
    } else {
      this.filePreview = null;
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 150;
        let w = img.width, h = img.height;
        if (w > h) { h = h * MAX / w; w = MAX; }
        else { w = w * MAX / h; h = MAX; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        if (this.profile) {
          this.profile.profilePicture = base64;
          const custId = parseInt(localStorage.getItem('custId') || '1');
          this.http.put(`${environment.apiUrl}/customers/${custId}`, {
            ...this.profile,
            profilePicture: base64
          }).subscribe();
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    if (!this.editName) {
      this.editError = 'Le nom est obligatoire';
      return;
    }
    if (this.editClientType !== 'STANDARD' && !this.selectedFile &&
        (this.profile as any)?.verificationStatus !== 'VERIFIED') {
      this.editError = 'Veuillez soumettre le document requis pour ce type de client';
      return;
    }

    this.editLoading = true;
    this.editError = '';
    const custId = parseInt(localStorage.getItem('custId') || '1');

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        this.http.put(`${environment.apiUrl}/customers/${custId}`, {
          ...this.profile,
          name: this.editName,
          phone: this.editPhone,
          clientType: this.editClientType,
          verificationStatus: 'PENDING',
          verificationDoc: base64.substring(0, 499)
        }).subscribe({
          next: () => {
            if (this.profile) {
              this.profile.name = this.editName;
              (this.profile as any).phone = this.editPhone;
              (this.profile as any).clientType = this.editClientType;
              (this.profile as any).verificationStatus = 'PENDING';
            }
            this.editLoading = false;
            this.editSuccess = true;
            setTimeout(() => { this.editMode = false; this.editSuccess = false; }, 2000);
          },
          error: () => { this.editLoading = false; this.editError = 'Erreur lors de la mise à jour'; }
        });
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.http.put(`${environment.apiUrl}/customers/${custId}`, {
        ...this.profile,
        name: this.editName,
        phone: this.editPhone,
        clientType: this.editClientType
      }).subscribe({
        next: () => {
          if (this.profile) {
            this.profile.name = this.editName;
            (this.profile as any).phone = this.editPhone;
            (this.profile as any).clientType = this.editClientType;
          }
          this.editLoading = false;
          this.editSuccess = true;
          setTimeout(() => { this.editMode = false; this.editSuccess = false; }, 2000);
        },
        error: () => { this.editLoading = false; this.editError = 'Erreur lors de la mise à jour'; }
      });
    }
  }

  getVerificationColor(): string {
    switch((this.profile as any)?.verificationStatus) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'danger';
      case 'PENDING': return 'warning';
      default: return 'secondary';
    }
  }

  getVerificationLabel(): string {
    switch((this.profile as any)?.verificationStatus) {
      case 'VERIFIED': return 'Vérifié';
      case 'REJECTED': return 'Rejeté';
      case 'PENDING': return 'En attente';
      default: return 'Non soumis';
    }
  }

  getServiceName(serviceId: number): string {
    const services: { [key: number]: string } = {
      1: 'WiFi', 2: 'Climatiseur', 3: 'Siège Ergo',
      4: 'Café', 5: 'Glacière', 6: 'GPS', 7: 'Radio'
    };
    return services[serviceId] || 'Service #' + serviceId;
  }
}