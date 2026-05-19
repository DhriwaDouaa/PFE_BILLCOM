import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { environment } from '../../../../environments/environment';

// ─── MODELS ────────────────────────────────────────────────────────
interface CommandLog {
  time: string;
  topic: string;
  label: string;
  payload: object;
  status: 'sent' | 'pending';
}

interface TelemetryData {
  speed: number;
  distance: number;
  cargoTemp: number;
  battery: number;
  billing: number;
  gpsLat: number;
  gpsLng: number;
  obstacles: { front: number; rear: number; left: number; right: number };
}

// ─── COMPONENT ─────────────────────────────────────────────────────
@Component({
  selector: 'app-vehicle-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-control.component.html',
  styleUrls: ['./vehicle-control.component.css']
})
export class VehicleControlComponent implements OnInit, AfterViewInit, OnDestroy {

  // ── STATE ──
  currentScreen: 1 | 2 | 3 = 1;
  photoLoaded = false;
  doorOpened = false;
  allDoorsVisible = false;

  vehicleId = 'SC-001';
  plate = 'TUN-001';
  model = 'Sedan Pro';
  serialNumber = 'A3F2-B7C1-D9E4';
  arrivalTime = new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });

  // ── TELEMETRY ──
  tele: TelemetryData = {
    speed: 0, distance: 0, cargoTemp: 22,
    battery: 87, billing: 0,
    gpsLat: 35.8356, gpsLng: 10.6150,
    obstacles: { front: 0, rear: 0, left: 0, right: 0 }
  };

  // ── CONTROLS STATE ──
  doors: Record<string, boolean> = { fl: false, fr: false, trunk: false };
  signals: Record<string, boolean> = { lights: false, left: false, right: false, horn: false };
  warnActive = false;
  currentDir = 'stop';
  motorSpeed = 50;

  // ── SERVICES ──
  services = [
    { key: 'clim', name: 'Climatisation', price: '0.15 DT/min', icon: 'ti-wind', type: 'toggle', on: false },
    { key: 'audio', name: 'Audio / Musique', price: '0.05 DT/min', icon: 'ti-music', type: 'toggle', on: false },
    { key: 'cafe', name: 'Café', price: '1.50 DT/dose', icon: 'ti-coffee', type: 'shot', count: 0, loading: false, sent: false },
    { key: 'eau', name: 'Eau minérale', price: '0.50 DT/unité', icon: 'ti-droplet', type: 'shot', count: 0, loading: false, sent: false },
  ];

  // ── COMMAND HISTORY ──
  commandLog: CommandLog[] = [];

  // ── MAP ──
  private map!: L.Map;
  private vehicleMarker!: L.Marker;
  private youMarker!: L.Marker;
  private pathLine!: L.Polyline;
  private pathPoints: L.LatLng[] = [];
  private youLat = 35.8356;
  private youLng = 10.6150;

  // ── TIMERS ──
  private ticker: any = null;
  private pollTimer: any = null;
  private warnInterval: any = null;
  private elapsed = 0;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.getGeolocation();
    this.startPolling();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.stopTicker();
    this.stopWarn();
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.map) this.map.remove();
  }

  // ─── NAVIGATION ────────────────────────────────────────────────
  goTo(screen: 1 | 2 | 3): void {
    this.currentScreen = screen;
    if (screen === 2) setTimeout(() => this.loadPhoto(), 1800);
    if (screen === 3) setTimeout(() => this.initMap(), 300);
  }

  // ─── GEOLOC ────────────────────────────────────────────────────
  private getGeolocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        this.youLat = pos.coords.latitude;
        this.youLng = pos.coords.longitude;
      });
    }
  }

  // ─── PHOTO ─────────────────────────────────────────────────────
  loadPhoto(): void {
    // En production: GET /api/safety/frame/{vehicleId}
    // retourne une image base64 de l'ESP32-CAM
    setTimeout(() => { this.photoLoaded = true; }, 0);
  }

  // ─── MAP LEAFLET ───────────────────────────────────────────────
  private initMap(): void {
    if (this.map) return;

    this.map = L.map('miniMap', {
      center: [this.tele.gpsLat, this.tele.gpsLng],
      zoom: 16, zoomControl: false, attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.map);

    // Marker vous
    this.youMarker = L.marker([this.youLat, this.youLng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#378ADD;border:2px solid white;box-shadow:0 0 8px #378ADD88"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
      })
    }).addTo(this.map).bindPopup('Vous');

    // Marker véhicule
    this.vehicleMarker = L.marker([this.tele.gpsLat, this.tele.gpsLng], {
      icon: this.makeVehIcon()
    }).addTo(this.map).bindPopup(this.plate);

    // Trace GPS
    this.pathPoints = [L.latLng(this.tele.gpsLat, this.tele.gpsLng)];
    this.pathLine = L.polyline(this.pathPoints, {
      color: '#1D9E75', weight: 2, opacity: 0.7, dashArray: '4,3'
    }).addTo(this.map);
  }

  private makeVehIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:36px;height:36px">
        <div style="position:absolute;inset:-6px;border-radius:50%;border:1.5px solid #1D9E75;opacity:.35;animation:neonPulse 2s infinite"></div>
        <div style="position:absolute;inset:0;border-radius:50%;background:#0d1f14;border:2px solid #1D9E75;display:flex;align-items:center;justify-content:center;font-size:16px">🚗</div>
      </div>`,
      iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20]
    });
  }

  private updateMap(): void {
    if (!this.map || !this.vehicleMarker) return;
    const latlng: L.LatLngExpression = [this.tele.gpsLat, this.tele.gpsLng];
    this.vehicleMarker.setLatLng(latlng);
    this.pathPoints.push(L.latLng(this.tele.gpsLat, this.tele.gpsLng));
    this.pathLine.setLatLngs(this.pathPoints);
    this.map.panTo(latlng, { animate: true, duration: 0.5 });
  }

  // ─── POLLING TELEMETRY ─────────────────────────────────────────
  private startPolling(): void {
    this.pollTimer = setInterval(() => {
      this.http.get<any>(`${environment.apiUrl}/iot/telemetry/${this.vehicleId}`).subscribe({
        next: (data) => {
          this.tele.speed = data.speed ?? 0;
          this.tele.distance = data.distanceKm ?? this.tele.distance;
          this.tele.cargoTemp = data.temperature ?? 22;
          this.tele.battery = data.battery ?? 87;
          this.tele.gpsLat = data.latitude ?? this.tele.gpsLat;
          this.tele.gpsLng = data.longitude ?? this.tele.gpsLng;
          this.tele.obstacles = {
            front: data.obstacles?.avant ?? 0,
            rear: data.obstacles?.arriere ?? 0,
            left: data.obstacles?.gauche ?? 0,
            right: data.obstacles?.droite ?? 0
          };
          if (this.currentScreen === 3) this.updateMap();
        },
        error: () => this.simulateTelemetry()
      });
    }, 1000);
  }

  private simulateTelemetry(): void {
    if (this.currentDir !== 'stop') {
      this.elapsed++;
      const spd = this.motorSpeed * 0.6;
      this.tele.speed = Math.round(spd);
      this.tele.distance += spd / 3600;
      this.tele.billing = this.tele.distance * 0.9 + this.elapsed * (0.05 / 60);
      this.tele.cargoTemp = 22 + Math.round(Math.random() * 3);
      this.tele.obstacles = {
        front: Math.round(30 + Math.random() * 200),
        rear: Math.round(30 + Math.random() * 200),
        left: Math.round(30 + Math.random() * 200),
        right: Math.round(30 + Math.random() * 200)
      };
      // Simuler mouvement GPS
      this.tele.gpsLat += 0.00002 * (this.currentDir === 'rev' ? -1 : 1);
      if (this.currentScreen === 3) this.updateMap();
    } else {
      this.tele.speed = 0;
    }
  }

  // ─── TICKER (billing fallback) ──────────────────────────────────
  startTicker(): void {
    if (this.ticker) return;
    this.ticker = setInterval(() => this.simulateTelemetry(), 1000);
  }

  stopTicker(): void {
    if (this.ticker) { clearInterval(this.ticker); this.ticker = null; }
    this.tele.speed = 0;
  }

  // ─── DOOR CONTROLS ─────────────────────────────────────────────
  openMainDoor(): void {
    this.doorOpened = true;
    this.sendCommand('carte2/door', { door: 'fl', action: 'open' }, 'Ouvrir porte avant G');
    this.sendCommand('carte2/door', { door: 'fr', action: 'open' }, 'Ouvrir porte avant D');
    this.doors['fl'] = true;
    this.doors['fr'] = true;
    setTimeout(() => { this.allDoorsVisible = true; }, 600);
  }

  toggleDoor(door: string): void {
    this.doors[door] = !this.doors[door];
    const action = this.doors[door] ? 'open' : 'close';
    const labels: Record<string, string> = { fl: 'Porte avant G', fr: 'Porte avant D', trunk: 'Coffre' };
    this.sendCommand('carte2/door', { door, action }, `${action === 'open' ? 'Ouvrir' : 'Fermer'} ${labels[door]}`);
  }

  // ─── DIRECTION ─────────────────────────────────────────────────
  setDirection(dir: string): void {
    this.currentDir = dir;
    const cmdMap: Record<string, object> = {
      fwd:   { motorFL: 'FWD', motorFR: 'FWD', motorRL: 'FWD', motorRR: 'FWD', pwm: this.motorSpeed },
      rev:   { motorFL: 'REV', motorFR: 'REV', motorRL: 'REV', motorRR: 'REV', pwm: this.motorSpeed },
      left:  { motorFL: 'REV', motorFR: 'FWD', motorRL: 'REV', motorRR: 'FWD', pwm: this.motorSpeed },
      right: { motorFL: 'FWD', motorFR: 'REV', motorRL: 'FWD', motorRR: 'REV', pwm: this.motorSpeed },
      stop:  { motorFL: 'STOP', motorFR: 'STOP', motorRL: 'STOP', motorRR: 'STOP', pwm: 0 }
    };
    this.sendCommand('carte1/commands', cmdMap[dir], `Direction: ${dir.toUpperCase()}`);
    if (dir !== 'stop') this.startTicker(); else this.stopTicker();
  }

  onSpeedChange(val: number): void {
    this.motorSpeed = val;
    if (this.currentDir !== 'stop') {
      this.sendCommand('carte1/commands', { pwm: val }, `Vitesse PWM: ${val}%`);
    }
  }

  // ─── SIGNALISATION ─────────────────────────────────────────────
  toggleSignal(sig: string): void {
    if (sig === 'left' || sig === 'right') this.stopWarn();
    this.signals[sig] = !this.signals[sig];
    const topics: Record<string, string> = {
      lights: 'carte3/signal', left: 'carte3/signal',
      right: 'carte3/signal', horn: 'carte3/signal'
    };
    const cmds: Record<string, object> = {
      lights: { led: 'phares', state: this.signals[sig] },
      left:   { led: 'clignotant_gauche', state: this.signals[sig] },
      right:  { led: 'clignotant_droit', state: this.signals[sig] },
      horn:   { buzzer: this.signals[sig] }
    };
    const labels: Record<string, string> = {
      lights: 'Phares', left: 'Clignotant G', right: 'Clignotant D', horn: 'Klaxon'
    };
    this.sendCommand(topics[sig], cmds[sig], `${labels[sig]}: ${this.signals[sig] ? 'ON' : 'OFF'}`);
  }

  toggleWarn(): void {
    if (this.warnActive) {
      this.stopWarn();
    } else {
      this.signals['left'] = false;
      this.signals['right'] = false;
      this.warnActive = true;
      this.sendCommand('carte3/signal', { led: 'warning', state: true }, 'Warning (2 faces): ON');
      let flash = true;
      this.warnInterval = setInterval(() => {
        this.signals['left'] = flash;
        this.signals['right'] = flash;
        flash = !flash;
      }, 600);
    }
  }

  stopWarn(): void {
    if (this.warnInterval) { clearInterval(this.warnInterval); this.warnInterval = null; }
    this.warnActive = false;
    this.signals['left'] = false;
    this.signals['right'] = false;
    this.sendCommand('carte3/signal', { led: 'warning', state: false }, 'Warning: OFF');
  }

  // ─── SERVICES ──────────────────────────────────────────────────
  toggleService(svc: any): void {
    svc.on = !svc.on;
    const cmds: Record<string, object> = {
      clim:  { relay: 'peltier', state: svc.on },
      audio: { audio: svc.on ? 'play' : 'stop' }
    };
    const topic = svc.key === 'audio' ? 'carte3/signal' : 'carte1/commands';
    this.sendCommand(topic, cmds[svc.key], `${svc.name}: ${svc.on ? 'ON' : 'OFF'}`);
  }

  dispenseShot(svc: any): void {
    if (svc.loading) return;
    svc.loading = true;
    svc.sent = false;
    const cmds: Record<string, object> = {
      cafe: { relay: 'cafe', action: 'dispense', qty: 1 },
      eau:  { relay: 'eau',  action: 'dispense', qty: 1 }
    };
    this.sendCommand('carte1/commands', cmds[svc.key], `${svc.name}: commander 1`);
    setTimeout(() => {
      svc.loading = false;
      svc.sent = true;
      svc.count++;
      setTimeout(() => { svc.sent = false; }, 2000);
    }, 1200);
  }

  // ─── COMMAND SENDER ────────────────────────────────────────────
  private sendCommand(topic: string, payload: object, label: string): void {
    const fullTopic = `smartcar/${this.vehicleId}/${topic}`;
    const entry: CommandLog = {
      time: new Date().toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      topic: fullTopic, label, payload, status: 'pending'
    };
    this.commandLog.unshift(entry);
    if (this.commandLog.length > 20) this.commandLog.pop();

    this.http.post(`${environment.apiUrl}/iot/command`, { topic: fullTopic, payload }).subscribe({
      next: () => { entry.status = 'sent'; },
      error: () => { entry.status = 'sent'; } // mock: toujours OK en dev
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────────
  getObsClass(val: number): string {
    if (val === 0) return '';
    return val < 40 ? 'danger' : val < 80 ? 'warn' : 'ok';
  }

  getShotLabel(svc: any): string {
    if (svc.loading) return '...';
    if (svc.sent) return 'Envoyé ✓';
    return 'Commander';
  }

  // ─── STOP MISSION ──────────────────────────────────────────────
  stopMission(): void {
    this.stopTicker();
    this.stopWarn();
    this.http.post(`${environment.apiUrl}/iot/command`, {
      topic: `smartcar/${this.vehicleId}/carte1/commands`,
      payload: { motorFL: 'STOP', motorFR: 'STOP', motorRL: 'STOP', motorRR: 'STOP', pwm: 0 }
    }).subscribe();
    this.router.navigate(['/member/factures']);
  }
}
