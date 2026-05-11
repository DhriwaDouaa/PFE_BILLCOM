import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IotService, IotData } from '../../services/iot.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicules.component.html',
  styleUrl: './vehicules.component.css'
})
export class VehiculesComponent implements OnInit, OnDestroy, AfterViewInit {
  custId = 1;
  iotData: IotData | null = null;
  carCalled = false;
  clientPosition: [number, number] | null = null;
  statusMessage = '';

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

  constructor(private iotService: IotService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  initMap() {
    this.map = L.map('map').setView([36.8065, 10.1815], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  getActiveCount(): number {
    return this.vehicles.filter(v => v.status === 'ACTIVE').length;
  }

  getInactiveCount(): number {
    return this.vehicles.filter(v => v.status !== 'ACTIVE').length;
  }

  callCar() {
    this.statusMessage = 'Localisation en cours...';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.clientPosition = [pos.coords.latitude, pos.coords.longitude];
        this.carCalled = true;
        this.statusMessage = 'Véhicule en route vers vous!';

        if (this.clientMarker) this.map.removeLayer(this.clientMarker);
        const clientIcon = L.divIcon({
          html: '<i class="bi bi-person-fill" style="font-size:28px;color:#0d6efd"></i>',
          className: '', iconAnchor: [14, 28]
        });
        this.clientMarker = L.marker(this.clientPosition!, { icon: clientIcon })
          .addTo(this.map)
          .bindPopup('Votre position')
          .openPopup();

        this.map.setView(this.clientPosition!, 15);
        this.startPolling();
      },
      () => {
        this.statusMessage = 'Impossible de récupérer votre position.';
      }
    );
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      this.iotService.getLatestPosition(this.custId).subscribe({
        next: (data) => {
          this.iotData = data;
          this.updateCarOnMap(data.latitude, data.longitude);
        },
        error: () => {
          this.updateCarOnMap(36.8100, 10.1850);
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
    this.carMarker = L.marker([lat, lng], { icon: carIcon })
      .addTo(this.map)
      .bindPopup('Smart Car');

    if (this.clientPosition) {
      if (this.routeLine) this.map.removeLayer(this.routeLine);
      this.routeLine = L.polyline([this.clientPosition, [lat, lng]], {
        color: '#0d6efd', weight: 3, dashArray: '8,8'
      }).addTo(this.map);

      const bounds = L.latLngBounds([this.clientPosition, [lat, lng]]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  cancelCar() {
    this.carCalled = false;
    this.statusMessage = '';
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