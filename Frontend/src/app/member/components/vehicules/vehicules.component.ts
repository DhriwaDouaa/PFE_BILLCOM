import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { IotService, IotData } from '../../services/iot.service';
import { environment } from '../../../../environments/environment';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicules.component.html',
  styleUrl: './vehicules.component.css'
})
export class VehiculesComponent implements OnInit, OnDestroy, AfterViewInit {
  custId: number = parseInt(localStorage.getItem('custId') || '1');
  iotData: IotData | null = null;
  carCalled = false;
  clientPosition: [number, number] | null = null;
  statusMessage = '';
  errorMessage = '';
  customerBalance: number = 0;
  estimatedDistance: number = 0;
  estimatedPrice: number = 0;
  readonly TARIF_KM = 0.9;
  showConfirmation = false;
  carAvailable = false;
  profile: any = null;
  sessionStart: string = '';

  services = [
    { id: 2, name: 'Climatiseur', icon: 'bi-snow', price: 0.05, unit: 'MIN', active: false, color: 'info', startTime: '' },
    { id: 3, name: 'Siège Ergonomique', icon: 'bi-person-fill', price: 0.03, unit: 'MIN', active: false, color: 'warning', startTime: '' },
    { id: 7, name: 'Radio', icon: 'bi-music-note-beamed', price: 0.02, unit: 'MIN', active: false, color: 'success', startTime: '' },
    { id: 1, name: 'WiFi', icon: 'bi-wifi', price: 0.01, unit: 'MIN', active: false, color: 'primary', startTime: '' },
  ];

  eventServices = [
    { id: 4, name: 'Café', icon: 'bi-cup-hot-fill', price: 1.5, unit: 'DOSE', color: 'warning', quantity: 0 },
    { id: 5, name: 'Eau', icon: 'bi-droplet-fill', price: 0.5, unit: 'UNITE', color: 'info', quantity: 0 },
  ];

  vehicles: any[] = [
    { brand: 'Toyota', model: 'Corolla', year: 2022, licensePlate: '100 TUN 1234', color: 'Blanc', fuel: 'Essence', status: 'ACTIVE' },
    { brand: 'Renault', model: 'Clio', year: 2021, licensePlate: '200 TUN 5678', color: 'Rouge', fuel: 'Diesel', status: 'ACTIVE' },
    { brand: 'Peugeot', model: '208', year: 2020, licensePlate: '300 TUN 9012', color: 'Bleu', fuel: 'Essence', status: 'ACTIVE' },
    { brand: 'Volkswagen', model: 'Golf', year: 2019, licensePlate: '400 TUN 3456', color: 'Noir', fuel: 'Diesel', status: 'INACTIVE' },
    { brand: 'Hyundai', model: 'i20', year: 2018, licensePlate: '500 TUN 7890', color: 'Gris', fuel: 'Essence', status: 'INACTIVE' },
    { brand: 'Kia', model: 'Picanto', year: 2017, licensePlate: '600 TUN 1122', color: 'Vert', fuel: 'Essence', status: 'INACTIVE' }
  ];

  private map!: L.Map;
  private carMarker!: L.Marker;
  private clientMarker!: L.Marker;
  private routeLine!: L.Polyline;
  private pollInterval: any;

  constructor(private iotService: IotService, private http: HttpClient) {}

  ngOnInit() {
    this.loadCustomerBalance();
    this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
      next: (data) => { this.profile = data; }
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initMap();
      this.restoreSession();
    }, 200);
  }

  restoreSession() {
    const session = localStorage.getItem('carSession');
    if (session) {
      const s = JSON.parse(session);
      this.carCalled = s.carCalled;
      this.clientPosition = s.clientPosition;
      this.estimatedDistance = s.estimatedDistance;
      this.estimatedPrice = s.estimatedPrice;
      this.statusMessage = s.statusMessage;
      this.sessionStart = s.sessionStart || new Date().toISOString();
      if (this.carCalled && this.clientPosition) {
        const clientIcon = L.divIcon({
          html: '<i class="bi bi-person-fill" style="font-size:28px;color:#0d6efd"></i>',
          className: '', iconAnchor: [14, 28]
        });
        this.clientMarker = L.marker(this.clientPosition!, { icon: clientIcon })
          .addTo(this.map).bindPopup('Votre position').openPopup();
        this.map.setView(this.clientPosition!, 15);
        this.startPolling();
      }
    }
  }

  loadCustomerBalance() {
    this.http.get<any>(`${environment.apiUrl}/customers/${this.custId}`).subscribe({
      next: (customer) => { this.customerBalance = customer.balance ?? 0; },
      error: () => { this.customerBalance = 0; }
    });
  }

  initMap() {
    this.map = L.map('map').setView([35.8245, 10.6346], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  getActiveCount(): number { return this.vehicles.filter(v => v.status === 'ACTIVE').length; }
  getInactiveCount(): number { return this.vehicles.filter(v => v.status !== 'ACTIVE').length; }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  demanderVehicule() {
    this.errorMessage = '';
    if (this.profile?.verificationStatus !== 'VERIFIED') {
      this.errorMessage = 'Compte non vérifié. Veuillez soumettre vos documents dans votre profil pour accéder aux services.';
      return;
    }
    this.statusMessage = 'Localisation en cours...';
    this.showConfirmation = false;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.clientPosition = [pos.coords.latitude, pos.coords.longitude];

        if (this.clientMarker) this.map.removeLayer(this.clientMarker);
        const clientIcon = L.divIcon({
          html: '<i class="bi bi-person-fill" style="font-size:28px;color:#0d6efd"></i>',
          className: '', iconAnchor: [14, 28]
        });
        this.clientMarker = L.marker(this.clientPosition!, { icon: clientIcon })
          .addTo(this.map).bindPopup('Votre position').openPopup();
        this.map.setView(this.clientPosition!, 15);

        // Check solde awwel
        if (!this.customerBalance || this.customerBalance <= 0) {
          this.statusMessage = '';
          this.errorMessage = 'Solde insuffisant (0.000 TND). Veuillez recharger votre compte.';
          return;
        }

        this.statusMessage = 'Recherche d\'un véhicule disponible...';
        this.iotService.getLatestPosition(this.custId).subscribe({
          next: (data) => {
            if (!data || !data.latitude) {
              this.carAvailable = false;
              this.statusMessage = '';
              this.errorMessage = 'Aucun véhicule disponible pour le moment.';
              return;
            }
            this.iotData = data;
            this.carAvailable = true;
            this.estimatedDistance = this.calculateDistance(
              this.clientPosition![0], this.clientPosition![1], data.latitude, data.longitude
            );
            this.estimatedPrice = Math.round(this.estimatedDistance * this.TARIF_KM * 1000) / 1000;
            this.updateCarOnMap(data.latitude, data.longitude);

            if (this.customerBalance >= this.estimatedPrice) {
              this.showConfirmation = true;
              this.statusMessage = 'Véhicule trouvé! Confirmez votre demande.';
            } else {
              this.showConfirmation = false;
              this.statusMessage = '';
              this.errorMessage = `Solde insuffisant. Solde actuel: ${this.customerBalance.toFixed(3)} TND. Montant requis: ${this.estimatedPrice.toFixed(3)} TND.`;
            }
          },
          error: () => {
            this.carAvailable = false;
            this.statusMessage = '';
            this.errorMessage = 'Aucun véhicule disponible pour le moment.';
          }
        });
      },
      () => {
        this.statusMessage = '';
        this.errorMessage = 'Impossible de récupérer votre position.';
      }
    );
  }

  confirmerDemande() {
    this.showConfirmation = false;
    this.carCalled = true;
    this.sessionStart = new Date().toISOString();
    this.statusMessage = 'Demande envoyée! Le véhicule arrive...';

    localStorage.setItem('carSession', JSON.stringify({
      carCalled: true,
      clientPosition: this.clientPosition,
      estimatedDistance: this.estimatedDistance,
      estimatedPrice: this.estimatedPrice,
      statusMessage: this.statusMessage,
      initialBalance: this.customerBalance,
      sessionStart: this.sessionStart
    }));

    this.startPolling();
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      this.iotService.getLatestPosition(this.custId).subscribe({
        next: (data) => {
          this.iotData = data;
          this.updateCarOnMap(data.latitude, data.longitude);

          if (this.clientPosition) {
            const newDistance = this.calculateDistance(
              this.clientPosition[0], this.clientPosition[1], data.latitude, data.longitude
            );
            const newPrice = Math.round(newDistance * this.TARIF_KM * 1000) / 1000;

            const savedSession = localStorage.getItem('carSession');
            if (savedSession) {
              const s = JSON.parse(savedSession);
              const initialBalance = s.initialBalance ?? 0;
              const newBalance = Math.max(0, initialBalance - newPrice);

              this.estimatedDistance = newDistance;
              this.estimatedPrice = newPrice;
              this.customerBalance = newBalance;

              if (newDistance <= 0.05) {
                this.statusMessage = 'Le véhicule est arrivé! Bon voyage!';
                this.saveTripCdr();
                clearInterval(this.pollInterval);
                this.carCalled = false;
                localStorage.removeItem('carSession');
              } else if (newDistance <= 0.2) {
                this.statusMessage = 'Le véhicule est juste à côté de vous!';
              } else if (newDistance <= 0.5) {
                this.statusMessage = 'Le véhicule approche, encore quelques mètres...';
              } else if (newDistance <= 1) {
                this.statusMessage = 'Le véhicule est proche, moins d\'1 km!';
              } else if (newDistance <= 3) {
                this.statusMessage = 'Le véhicule arrive, environ ' + newDistance.toFixed(1) + ' km...';
              } else {
                this.statusMessage = 'Demande envoyée! Le véhicule arrive (' + newDistance.toFixed(1) + ' km)...';
              }

              this.http.patch(`${environment.apiUrl}/customers/${this.custId}/balance`,
                { balance: newBalance }).subscribe();

              if (newBalance <= 0) {
                clearInterval(this.pollInterval);
                this.carCalled = false;
                localStorage.removeItem('carSession');
                if (this.carMarker) this.map.removeLayer(this.carMarker);
                if (this.routeLine) this.map.removeLayer(this.routeLine);
                this.statusMessage = '';
                this.errorMessage = 'Votre solde est épuisé. Veuillez recharger votre compte pour continuer.';
              }
            }
          }
        },
        error: () => {
          this.updateCarOnMap(35.8280, 10.6380);
        }
      });
    }, 3000);
  }

  updateCarOnMap(lat: number, lng: number) {
    const carIcon = L.divIcon({
      html: '<i class="bi bi-car-front-fill" style="font-size:28px;color:#198754"></i>',
      className: '', iconAnchor: [14, 28]
    });
    if (this.carMarker) this.map.removeLayer(this.carMarker);
    this.carMarker = L.marker([lat, lng], { icon: carIcon }).addTo(this.map).bindPopup('Smart Car');

    if (this.clientPosition) {
      if (this.routeLine) this.map.removeLayer(this.routeLine);
      this.routeLine = L.polyline([this.clientPosition, [lat, lng]], {
        color: '#0d6efd', weight: 3, dashArray: '8,8'
      }).addTo(this.map);
      this.map.fitBounds(L.latLngBounds([this.clientPosition, [lat, lng]]), { padding: [50, 50] });
    }
  }

  toggleService(service: any) {
    service.active = !service.active;
    if (service.active) {
      service.startTime = new Date().toISOString();
    } else {
      const endTime = new Date().toISOString();
      const durationMin = (new Date(endTime).getTime() - new Date(service.startTime).getTime()) / 60000;
      const amount = Math.round(durationMin * service.price * 1000) / 1000;

      this.iotService.saveCdr({
        custId: this.custId,
        serviceId: service.id,
        sessionStart: service.startTime,
        sessionEnd: endTime,
        durationMin: Math.round(durationMin * 100) / 100,
        distanceKm: 0,
        wifiMb: 0,
        passengersCount: 1,
        optionsActivated: service.name,
        ecodriving: 0,
        rawAmount: amount,
        status: 'COMPLETED'
      }).subscribe();

      this.customerBalance = Math.max(0, this.customerBalance - amount);
      this.http.patch(`${environment.apiUrl}/customers/${this.custId}/balance`,
        { balance: this.customerBalance }).subscribe();
    }
  }

  commanderEvent(service: any) {
    service.quantity++;
    this.customerBalance = Math.max(0, this.customerBalance - service.price);

    this.http.patch(`${environment.apiUrl}/customers/${this.custId}/balance`,
      { balance: this.customerBalance }).subscribe();

    this.iotService.saveCdr({
      custId: this.custId,
      serviceId: service.id,
      sessionStart: new Date().toISOString(),
      sessionEnd: new Date().toISOString(),
      durationMin: 0,
      distanceKm: 0,
      wifiMb: 0,
      passengersCount: 1,
      optionsActivated: service.name,
      ecodriving: 0,
      rawAmount: service.price,
      status: 'COMPLETED'
    }).subscribe();
  }

  saveTripCdr() {
    this.iotService.saveCdr({
      custId: this.custId,
      serviceId: 6,
      sessionStart: this.sessionStart || new Date().toISOString(),
      sessionEnd: new Date().toISOString(),
      durationMin: 0,
      distanceKm: this.estimatedDistance,
      wifiMb: 0,
      passengersCount: 1,
      optionsActivated: 'GPS',
      ecodriving: 0,
      rawAmount: this.estimatedPrice,
      status: 'COMPLETED'
    }).subscribe();
  }

  annulerDemande() {
    this.saveTripCdr();
    this.carCalled = false;
    this.showConfirmation = false;
    this.statusMessage = '';
    this.errorMessage = '';
    this.estimatedDistance = 0;
    this.estimatedPrice = 0;
    this.services.forEach(s => s.active = false);
    this.eventServices.forEach(s => s.quantity = 0);
    localStorage.removeItem('carSession');
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.carMarker) this.map.removeLayer(this.carMarker);
    if (this.clientMarker) this.map.removeLayer(this.clientMarker);
    if (this.routeLine) this.map.removeLayer(this.routeLine);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    if (this.map) this.map.remove();
  }
}