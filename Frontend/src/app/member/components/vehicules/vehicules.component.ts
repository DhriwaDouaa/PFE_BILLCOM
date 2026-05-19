import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import * as L from 'leaflet';
import { Router } from '@angular/router';

interface ServiceVehicule {
  nom: string;
  prix: number;
  unite: string;
}

interface Vehicule {
  vehiculeId: number;
  immatriculation: string;
  modele: string;
  statut: string;
  latitude: number;
  longitude: number;
  distance: number;
  eta: number;
  rating: number;
  totalTrips: number;
  services: ServiceVehicule[];
}

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit, AfterViewInit, OnDestroy {

  vehicles: Vehicule[] = [];
  expandedId: number | null = null;
  selectedId: number | null = null;

  private map!: L.Map;
  private markers: Map<number, L.Marker> = new Map();
  private youMarker!: L.Marker;
  private routeLine: L.Polyline | null = null;
  private youLat = 35.8356;
  private youLng = 10.6150;
  private glowTimer: any = null;

  // Services disponibles par défaut (sera remplacé par API)
  private defaultServices: ServiceVehicule[] = [
    { nom: 'Climatiseur', prix: 0.15, unite: 'min' },
    { nom: 'WiFi embarqué', prix: 0.10, unite: 'min' },
    { nom: 'Radio / Audio', prix: 0.05, unite: 'min' },
    { nom: 'Siège confort', prix: 0.20, unite: 'min' },
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getGeolocation();
    this.loadVehicles();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
    if (this.glowTimer) clearTimeout(this.glowTimer);
  }

  // ─── GEOLOCALISATION ───────────────────────────────────────────
  private getGeolocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.youLat = pos.coords.latitude;
          this.youLng = pos.coords.longitude;
          if (this.map) {
            this.map.setView([this.youLat, this.youLng], 14);
            this.youMarker.setLatLng([this.youLat, this.youLng]);
          }
          this.calcDistances();
        },
        () => console.log('Geoloc refusée, position par défaut Sousse')
      );
    }
  }

  // ─── INIT MAP LEAFLET ───────────────────────────────────────────
  private initMap(): void {
    this.map = L.map('vehiculeMap', {
      center: [this.youLat, this.youLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Marker "Vous"
    this.youMarker = L.marker([this.youLat, this.youLng], {
      icon: this.makeYouIcon()
    }).addTo(this.map).bindPopup('<b style="font-size:13px;color:#378ADD">📍 Votre position</b>');

    // Placer markers véhicules si déjà chargés
    if (this.vehicles.length > 0) {
      this.placeMarkers();
    }
  }

  // ─── CHARGER VEHICULES ─────────────────────────────────────────
  private loadVehicles(): void {
    this.http.get<any[]>(`${environment.apiUrl}/vehicles`).subscribe({
      next: (data) => {
        this.vehicles = data.map(v => ({
          ...v,
          distance: this.haversine(this.youLat, this.youLng, v.latitude, v.longitude),
          eta: Math.round(this.haversine(this.youLat, this.youLng, v.latitude, v.longitude) / 0.5),
          rating: v.rating ?? 4.7,
          totalTrips: v.totalTrips ?? 0,
          immatriculation: v.plate ?? v.immatriculation,
          modele: v.model ?? v.modele,
          statut: v.statut ?? 'DISPONIBLE',
          vehiculeId: v.vehicleId ?? v.vehiculeId,
          services: v.services?.length ? v.services : this.defaultServices
        }));
        this.vehicles.sort((a, b) => a.distance - b.distance);
        if (this.map) this.placeMarkers();
      },
      error: () => this.loadMockVehicles()
    });
  }

  // Mock fallback si API pas prête
  private loadMockVehicles(): void {
    this.vehicles = [
      { vehiculeId: 1, immatriculation: 'CAR-01', modele: 'Sedan Pro', statut: 'DISPONIBLE', latitude: 35.8385, longitude: 10.6082, distance: 1.2, eta: 3, rating: 4.8, totalTrips: 142, services: this.defaultServices },
      { vehiculeId: 2, immatriculation: 'CAR-02', modele: 'SUV Elite', statut: 'DISPONIBLE', latitude: 35.8401, longitude: 10.6210, distance: 2.4, eta: 6, rating: 4.9, totalTrips: 98, services: this.defaultServices },
      { vehiculeId: 3, immatriculation: 'CAR-03', modele: 'Compact City', statut: 'OCCUPE', latitude: 35.8310, longitude: 10.6055, distance: 3.0, eta: 0, rating: 4.6, totalTrips: 207, services: this.defaultServices.slice(0, 2) },
      { vehiculeId: 4, immatriculation: 'CAR-04', modele: 'Sedan Plus', statut: 'DISPONIBLE', latitude: 35.8328, longitude: 10.6248, distance: 3.1, eta: 8, rating: 4.7, totalTrips: 76, services: this.defaultServices },
    ];
    if (this.map) this.placeMarkers();
  }

  // ─── PLACER MARKERS ────────────────────────────────────────────
  private placeMarkers(): void {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers.clear();

    this.vehicles.forEach(v => {
      const marker = L.marker([v.latitude, v.longitude], {
        icon: this.makeVehIcon(v, false)
      }).addTo(this.map);

      marker.bindPopup(this.makePopupContent(v));

      marker.on('click', () => {
        this.setGlow(v.vehiculeId, true);
        this.toggleExpand(v.vehiculeId);
        setTimeout(() => {
          const el = document.getElementById('vi_' + v.vehiculeId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      });

      this.markers.set(v.vehiculeId, marker);
    });
  }

  // ─── TOGGLE EXPAND ─────────────────────────────────────────────
  toggleExpand(id: number): void {
    const wasOpen = this.expandedId === id;
    this.expandedId = wasOpen ? null : id;
    if (wasOpen) this.clearRoute();

    // Reset glow tous les icons
    this.vehicles.forEach(v => {
      const iconBox = document.getElementById('ib_' + v.vehiculeId);
      const item = document.getElementById('vi_' + v.vehiculeId);
      const btn = document.getElementById('eb_' + v.vehiculeId);
      if (!iconBox || !item || !btn) return;

      const isThis = v.vehiculeId === id && !wasOpen;
      const nc = v.statut === 'DISPONIBLE' ? '#39ff7a' : '#ffb830';
      const bc = v.statut === 'DISPONIBLE' ? '#1D9E75' : '#EF9F27';

      iconBox.style.boxShadow = isThis ? `0 0 8px ${nc}, 0 0 18px ${nc}55` : 'none';
      iconBox.style.borderColor = isThis ? nc : bc;
      item.style.borderColor = isThis ? nc : '';
      item.style.boxShadow = isThis ? `0 0 0 1px ${nc}44` : '';
      btn.style.transform = isThis ? 'rotate(180deg)' : '';
    });
  }

  // ─── ZOOM TO VEHICULE (fitBounds YOU + VEHICULE) ───────────────
  zoomToVehicule(v: Vehicule): void {
    this.setGlow(v.vehiculeId, true);
    this.drawRoute(v.latitude, v.longitude);

    const bounds = L.latLngBounds(
      [this.youLat, this.youLng],
      [v.latitude, v.longitude]
    );
    this.map.flyToBounds(bounds, { padding: [48, 48], duration: 1.3, maxZoom: 16 });

    setTimeout(() => {
      const m = this.markers.get(v.vehiculeId);
      if (m) m.openPopup();
    }, 1400);

    if (this.glowTimer) clearTimeout(this.glowTimer);
    this.glowTimer = setTimeout(() => {
      this.setGlow(v.vehiculeId, false);
      this.clearRoute();
    }, 6000);
  }

  // ─── SELECT VEHICULE ───────────────────────────────────────────
  selectVehicule(v: Vehicule): void {
    if (v.statut !== 'DISPONIBLE') return;
    this.selectedId = v.vehiculeId;
    const role = localStorage.getItem('role'); const base = role === 'AGENT' ? '/agent' : '/member'; this.router.navigate([base + '/vehicle-control'], {
      queryParams: {
        vehicleId: 'SC-00' + v.vehiculeId,
        plate: v.immatriculation,
        model: v.modele
      }
    });
  }
   // ─── HELPERS MAP ───────────────────────────────────────────────
  private drawRoute(vLat: number, vLng: number): void {
    this.clearRoute();
    this.routeLine = L.polyline(
      [[this.youLat, this.youLng], [vLat, vLng]],
      { color: '#39ff7a', weight: 2, dashArray: '6,5', opacity: 0.75 }
    ).addTo(this.map);
  }

  private clearRoute(): void {
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
  }

  private setGlow(id: number, on: boolean): void {
    this.vehicles.forEach(v => {
      const m = this.markers.get(v.vehiculeId);
      if (m) m.setIcon(this.makeVehIcon(v, on && v.vehiculeId === id));
    });
  }

  // ─── ICONS ─────────────────────────────────────────────────────
  private makeYouIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="width:18px;height:18px;border-radius:50%;background:#378ADD;border:2px solid white;box-shadow:0 0 8px #378ADD,0 0 18px #378ADD88"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
  }

  private makeVehIcon(v: Vehicule, glow: boolean): L.DivIcon {
    const av = v.statut === 'DISPONIBLE';
    const nc = av ? '#39ff7a' : '#ffb830';
    const bc = av ? '#1D9E75' : '#EF9F27';
    const bg = av ? '#0d1f14' : '#1f1200';

    const rings = glow
      ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${nc};opacity:.8;animation:neonPulse 1s ease-in-out infinite"></div>
         <div style="position:absolute;inset:-15px;border-radius:50%;border:1.5px solid ${nc};opacity:.35;animation:neonPulse 1s ease-in-out infinite .3s"></div>`
      : `<div style="position:absolute;inset:-8px;border-radius:50%;border:1.5px solid ${bc};opacity:.3;animation:neonPulse 2.5s ease-in-out infinite"></div>`;

    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:40px;height:40px">
        ${rings}
        <div style="position:absolute;inset:0;border-radius:50%;background:${bg};border:2px solid ${glow ? nc : bc};display:flex;align-items:center;justify-content:center;font-size:18px;${glow ? `box-shadow:0 0 8px ${nc},0 0 20px ${nc}66` : ''}">🚗</div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -24]
    });
  }

  private makePopupContent(v: Vehicule): string {
    const av = v.statut === 'DISPONIBLE';
    const nc = av ? '#39ff7a' : '#ffb830';
    return `
      <div style="font-family:sans-serif;min-width:160px">
        <div style="font-size:14px;font-weight:500;color:${nc};margin-bottom:3px">🚗 ${v.immatriculation}</div>
        <div style="font-size:11px;color:#6a9a7a;margin-bottom:6px">${v.modele}</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:0.5px solid #1a3a2a">
          <span style="color:#6a9a7a">Distance</span><span style="color:#ddd;font-weight:500">${v.distance.toFixed(1)} km</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:0.5px solid #1a3a2a">
          <span style="color:#6a9a7a">ETA</span><span style="color:#ddd;font-weight:500">${av ? v.eta + ' min' : 'En course'}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;padding:3px 0">
          <span style="color:#6a9a7a">Statut</span><span style="color:${nc};font-weight:500">${av ? 'Disponible' : 'Occupé'}</span>
        </div>
      </div>`;
  }

  // ─── HAVERSINE ─────────────────────────────────────────────────
  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }

  private calcDistances(): void {
    this.vehicles = this.vehicles.map(v => ({
      ...v,
      distance: this.haversine(this.youLat, this.youLng, v.latitude, v.longitude),
      eta: Math.round(this.haversine(this.youLat, this.youLng, v.latitude, v.longitude) / 0.5)
    })).sort((a, b) => a.distance - b.distance);
  }
}
