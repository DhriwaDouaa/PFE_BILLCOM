import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface ClientInfo {
  custId: number;
  name: string;
  phone: string;
  clientType: string;
  missionStatus: 'active' | 'idle' | 'pending';
  balance: number;
}

interface CdrLog {
  cdrId: number;
  clientName: string;
  distanceKm: number;
  durationMin: number;
  amount: number;
  date: string;
  status: string;
}

interface Notif {
  id: number;
  type: 'warning' | 'info' | 'success';
  message: string;
  time: string;
  actionLabel?: string;
  clientId?: number;
}

interface AgentStats {
  totalClients: number;
  missionsToday: number;
  kmToday: number;
  revenueToday: number;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit, OnDestroy {

  name = '';
  email = '';
  phone = '';
  speciality = '';
  supervisorName = '';
  hiredAt = '';
  agentInitials = '';

  stats: AgentStats = { totalClients: 0, missionsToday: 0, kmToday: 0, revenueToday: 0 };
  clients: ClientInfo[] = [];
  cdrLogs: CdrLog[] = [];
  notifications: Notif[] = [];
  private pollTimer: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.pollTimer = setInterval(() => this.loadDashboard(), 15000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  loadDashboard(): void {
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.get<any>(`${environment.apiUrl}/agent/dashboard?userId=${userId}`).subscribe({
      next: (d) => {
        this.name = d.name ?? '';
        this.email = d.email ?? localStorage.getItem('email') ?? '';
        this.phone = d.phone ?? '';
        this.speciality = d.speciality ?? '';
        this.supervisorName = d.supervisorName ?? '';
        this.hiredAt = d.hiredAt ?? '';
        this.agentInitials = this.getInitials(this.name);
        this.clients = d.clients ?? [];
        this.stats = d.stats ?? this.stats;
        this.cdrLogs = d.cdrLogs ?? [];
        this.buildNotifs();
      },
      error: () => this.loadMock()
    });
  }

  private loadMock(): void {
    this.name = localStorage.getItem('username') ?? 'Karim Trabelsi';
    this.email = localStorage.getItem('email') ?? 'agent1@bss.com';
    this.phone = '+216 20 111 222';
    this.speciality = 'Transport';
    this.supervisorName = 'Mohamed Ben Salah';
    this.hiredAt = 'Janvier 2026';
    this.agentInitials = this.getInitials(this.name);
    this.clients = [
      { custId: 1, name: 'Ahmed Ben Ali', phone: '+216 20 123 456', clientType: 'STANDARD', missionStatus: 'idle', balance: 15.500 },
      { custId: 2, name: 'Fatma Riahi', phone: '+216 55 987 654', clientType: 'VIP', missionStatus: 'idle', balance: 42.000 },
      { custId: 3, name: 'Omar Mejri', phone: '+216 98 456 123', clientType: 'STANDARD', missionStatus: 'pending', balance: 8.200 },
    ];
    this.stats = { totalClients: 3, missionsToday: 12, kmToday: 48.7, revenueToday: 18.450 };
    this.cdrLogs = [
      { cdrId: 12, clientName: 'Ahmed Ben Ali', distanceKm: 3.2, durationMin: 8, amount: 2.880, date: "Aujourd'hui", status: 'BILLED' },
      { cdrId: 11, clientName: 'Omar Mejri', distanceKm: 5.1, durationMin: 14, amount: 4.590, date: "Aujourd'hui", status: 'BILLED' },
      { cdrId: 10, clientName: 'Fatma Riahi', distanceKm: 2.8, durationMin: 7, amount: 2.520, date: 'Hier', status: 'BILLED' },
      { cdrId: 9, clientName: 'Ahmed Ben Ali', distanceKm: 4.3, durationMin: 11, amount: 3.870, date: 'Hier', status: 'BILLED' },
      { cdrId: 8, clientName: 'Omar Mejri', distanceKm: 1.9, durationMin: 5, amount: 1.710, date: '15/05', status: 'BILLED' },
    ];
    this.buildNotifs();
  }

  private buildNotifs(): void {
    this.notifications = [];
    this.clients.filter(c => c.missionStatus === 'pending').forEach(c => {
      this.notifications.push({ id: c.custId, type: 'warning', message: `${c.name} attend un véhicule`, time: 'En attente', actionLabel: 'Lancer mission', clientId: c.custId });
    });
    if (this.cdrLogs.length > 0) {
      const l = this.cdrLogs[0];
      this.notifications.push({ id: 99, type: 'success', message: `Mission terminée — ${l.clientName} · ${l.distanceKm} km · ${l.amount.toFixed(3)} DT`, time: l.date });
    }
  }

  launchMission(client: ClientInfo): void {
    this.router.navigate(['/agent/vehicules'], { queryParams: { clientId: client.custId, clientName: client.name } });
  }

  launchByNotif(notif: Notif): void {
    const c = this.clients.find(x => x.custId === notif.clientId);
    if (c) this.launchMission(c);
  }

  getMissionLabel(s: string): string {
    return ({ active: 'En mission', idle: 'Disponible', pending: 'En attente' } as any)[s] ?? s;
  }

  getPillClass(s: string): string {
    return ({ active: 'pill-green', idle: 'pill-gray', pending: 'pill-amber' } as any)[s] ?? 'pill-gray';
  }

  getNotifDot(t: string): string {
    return ({ warning: 'nd-warn', info: 'nd-info', success: 'nd-success' } as any)[t] ?? 'nd-info';
  }

  getInitials(n: string): string {
    return n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
