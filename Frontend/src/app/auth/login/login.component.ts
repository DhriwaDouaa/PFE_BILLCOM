import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  // Navigation
  activeSection = 'hero';
  menuOpen = false;
  scrolled = false;

  // Login
  email = '';
  password = '';
  error = '';
  loading = false;
  showPassword = false;
  activeTab: string = 'login';

  // Signup multi-étapes
  signupStep = 1;
  signupFirstName = '';
  signupLastName = '';
  signupBirthDate = '';
  signupClientType = '';
  signupUniversity = '';
  signupSportCenter = '';
  signupEmail = '';
  signupPassword = '';
  signupConfirmPassword = '';
  signupError = '';
  signupSuccess = false;
  signupLoading = false;

  // Stats animées
  statCustomers = 0;
  statServices = 0;
  statCdrs = 0;

  // Particles
  particles: any[] = [];

  selectedService: any = null;


  

services = [
  {
    icon: 'bi-wifi',
    title: 'WiFi Voiture',
    desc: 'Connexion haut débit dans votre véhicule',
    color: 'text-info',
    bg: 'bg-info',
    details: 'Profitez d\'une connexion WiFi ultra-rapide dans votre véhicule connecté. Facturation automatique par MB consommé via notre moteur de rating BSS.',
    features: ['Connexion 4G/5G', 'Facturation par MB', 'Gratuit jusqu\'à 500MB', 'Disponible 24h/24'],
    price: '0.0100 DT/MB',
    code: 'SRV-WIFI-001',
    type: 'CONNECTIVITY',
    billing: 'FREEMIUM'
  },
  {
    icon: 'bi-thermometer-sun',
    title: 'Climatiseur',
    desc: 'Climatisation intelligente contrôlée',
    color: 'text-warning',
    bg: 'bg-warning',
    details: 'Système de climatisation intelligent avec contrôle automatique de la température. Facturation à la minute selon votre utilisation réelle.',
    features: ['Contrôle température', 'Économie d\'énergie', 'Facturation par minute', 'Mode eco disponible'],
    price: '0.0500 DT/MIN',
    code: 'SRV-CLIM-002',
    type: 'COMFORT',
    billing: 'SESSION'
  },
  {
    icon: 'bi-cup-hot-fill',
    title: 'Machine à Café',
    desc: 'Café bio RFID à la demande',
    color: 'text-danger',
    bg: 'bg-danger',
    details: 'Machine à café intégrée avec capsules bio détectées par RFID. Profitez d\'une remise automatique sur les capsules bio certifiées.',
    features: ['Capsules bio RFID', 'Remise 15% bio', 'Facturation par dose', 'Plusieurs saveurs'],
    price: '1.5000 DT/DOSE',
    code: 'SRV-CAFE-004',
    type: 'COMFORT',
    billing: 'EVENT'
  },
  {
    icon: 'bi-geo-alt-fill',
    title: 'GPS Navigation',
    desc: 'Navigation GPS incluse gratuitement',
    color: 'text-success',
    bg: 'bg-success',
    details: 'Navigation GPS haute précision incluse dans tous vos trajets. Service totalement gratuit, enregistré automatiquement dans vos CDR.',
    features: ['Navigation temps réel', 'Inclus gratuitement', 'Mise à jour auto', 'Points d\'intérêt'],
    price: 'GRATUIT',
    code: 'SRV-GPS-006',
    type: 'NAVIGATION',
    billing: 'INCLUDED'
  },
  {
    icon: 'bi-person-workspace',
    title: 'Siège Ergonomique',
    desc: 'Confort optimal avec massage',
    color: 'text-primary',
    bg: 'bg-primary',
    details: 'Siège ergonomique intelligent avec fonction massage et chauffage. Adaptez votre confort selon vos préférences pour chaque trajet.',
    features: ['Massage intégré', 'Chauffage siège', 'Facturation par minute', 'Profil personnalisé'],
    price: '0.0300 DT/MIN',
    code: 'SRV-SIEG-003',
    type: 'COMFORT',
    billing: 'SESSION'
  },
  {
    icon: 'bi-speaker-fill',
    title: 'Radio & Musique',
    desc: 'Streaming musical intégré',
    color: 'text-info',
    bg: 'bg-info',
    details: 'Système audio premium avec streaming musical intégré. Profitez de vos playlists et stations radio préférées pendant vos trajets.',
    features: ['Streaming musical', 'Radio intégrée', 'Bluetooth', 'Facturation par minute'],
    price: '0.0200 DT/MIN',
    code: 'SRV-RADI-007',
    type: 'ENTERTAINMENT',
    billing: 'SESSION'
  }
];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.generateParticles();
    this.loadStats();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 50;
  }

  generateParticles() {
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        delay: Math.random() * 5 + 's',
        size: (Math.random() * 4 + 2) + 'px'
      });
    }
  }

  loadStats() {
    this.http.get<any[]>('/api/customers').subscribe({
      next: (d) => this.animateNumber('statCustomers', d.length)
    });
    this.http.get<any[]>('/api/services').subscribe({
      next: (d) => this.animateNumber('statServices', d.length)
    });
    this.http.get<any[]>('/api/cdr-logs').subscribe({
      next: (d) => this.animateNumber('statCdrs', d.length)
    });
  }

  animateNumber(prop: string, target: number) {
    let current = 0;
    const step = target / 30;
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        (this as any)[prop] = target;
        clearInterval(interval);
      } else {
        (this as any)[prop] = Math.floor(current);
      }
    }, 50);
  }

  scrollTo(section: string) {
    this.activeSection = section;
    this.menuOpen = false;
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.signupStep = 1;
    this.signupError = '';
    this.signupSuccess = false;
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }
    if (!this.isPasswordValid()) {
      this.error = 'Le mot de passe ne respecte pas les conditions';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post<any>('/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.loading = false;
        localStorage.setItem('role', res.role);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('custId', res.custId);
        localStorage.setItem('username', res.username);
        if (res.role === 'ADMIN' || res.role === 'SUPERVISOR' || res.role === 'AGENT') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/member/profile']);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou mot de passe incorrect';
      }
    });
  }

  // Signup steps
  nextStep() {
    if (this.signupStep === 1) {
      if (!this.signupFirstName || !this.signupLastName || !this.signupBirthDate) {
        this.signupError = 'Veuillez remplir tous les champs';
        return;
      }
      this.signupError = '';
      this.signupStep = 2;
    } else if (this.signupStep === 2) {
      if (!this.signupClientType) {
        this.signupError = 'Veuillez choisir un type de client';
        return;
      }
      if (this.signupClientType === 'ETUDIANT' && !this.signupUniversity) {
        this.signupError = 'Veuillez entrer votre université';
        return;
      }
      if (this.signupClientType === 'SPORTIF' && !this.signupSportCenter) {
        this.signupError = 'Veuillez entrer votre salle de sport';
        return;
      }
      this.signupError = '';
      this.signupStep = 3;
    }
  }

  prevStep() {
    if (this.signupStep > 1) this.signupStep--;
    this.signupError = '';
  }

  signup() {
  if (!this.signupEmail || !this.signupPassword || !this.signupConfirmPassword) {
    this.signupError = 'Veuillez remplir tous les champs';
    return;
  }
  if (this.signupPassword !== this.signupConfirmPassword) {
    this.signupError = 'Les mots de passe ne correspondent pas';
    return;
  }

  this.signupLoading = true;
  this.signupError = '';

  const newUser = {
    username: this.signupFirstName + ' ' + this.signupLastName,
    email: this.signupEmail,
    password: this.signupPassword,
    role: 'MEMBER',
    custId: null
  };

  this.http.post<any>('/api/users', newUser).subscribe({
    next: () => {
      this.signupLoading = false;
      this.signupSuccess = true;
      setTimeout(() => {
        this.activeTab = 'login';
        this.email = this.signupEmail;
        this.signupStep = 1;
      }, 2000);
    },
    error: () => {
      this.signupLoading = false;
      this.signupError = 'Erreur lors de la création du compte';
    }
  });
}

  getAge(): number {
    if (!this.signupBirthDate) return 0;
    const birth = new Date(this.signupBirthDate);
    const today = new Date();
    return today.getFullYear() - birth.getFullYear();
  }

  isMineur(): boolean {
    return this.getAge() < 18;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  isPasswordValid(): boolean {
    return this.password.length >= 8 &&
      /[A-Z]/.test(this.password) &&
      /[0-9]/.test(this.password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(this.password);
  }

  hasUpperCase(): boolean { return /[A-Z]/.test(this.password); }
  hasNumber(): boolean { return /[0-9]/.test(this.password); }
  hasSpecial(): boolean { return /[!@#$%^&*(),.?":{}|<>]/.test(this.password); }

  getPasswordStrength(): number {
    const p = this.signupPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s += 33;
    if (/[A-Z]/.test(p)) s += 33;
    if (/[0-9]/.test(p)) s += 34;
    return s;
  }

  getPasswordLabel(): string {
    const s = this.getPasswordStrength();
    if (s <= 33) return 'Faible';
    if (s <= 66) return 'Moyen';
    return 'Fort';
  }
    openServiceModal(service: any) {
    this.selectedService = service;
  }

  closeServiceModal() {
    this.selectedService = null;
  }
}