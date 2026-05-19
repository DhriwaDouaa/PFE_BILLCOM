import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface UnassignedClient {
  custId: number;
  name: string;
  phone: string;
  clientType: string;
}

interface AssignedClient {
  custId: number;
  name: string;
  phone: string;
  clientType: string;
  missionStatus: string;
  balance: number;
}

interface Agent {
  agentId: number;
  userId: number;
  name: string;
  speciality: string;
  isActive: boolean;
  clientCount: number;
  clients: AssignedClient[];
  expanded: boolean;
  selectedClientId: number | null;
}

interface Mission {
  agentName: string;
  clientName: string;
  plate: string;
  distanceKm: number;
  durationMin: number;
  amount: number;
}

interface SupervisorStats {
  totalAgents: number;
  totalClients: number;
  activeMissions: number;
  todayRevenue: number;
}

@Component({
  selector: 'app-supervisor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-dashboard.component.html',
  styleUrls: ['./supervisor-dashboard.component.css']
})
export class SupervisorDashboardComponent implements OnInit, OnDestroy {

  supervisorName = '';
  supervisorInitials = '';
  department = '';

  stats: SupervisorStats = { totalAgents: 0, totalClients: 0, activeMissions: 0, todayRevenue: 0 };
  agents: Agent[] = [];
  activeMissions: Mission[] = [];
  unassignedClients: UnassignedClient[] = [];
  private pollTimer: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadUnassigned();
    this.pollTimer = setInterval(() => this.loadMissions(), 10000);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
  }

  private loadDashboard(): void {
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.get<any>(`${environment.apiUrl}/supervisor/dashboard?userId=${userId}`).subscribe({
      next: (data) => {
        this.supervisorName = data.name ?? 'Superviseur';
        this.department = data.department ?? '';
        this.supervisorInitials = this.getInitials(this.supervisorName);
        this.stats = data.stats ?? this.stats;
        this.activeMissions = data.activeMissions ?? [];
        this.agents = (data.agents ?? []).map((a: any, i: number) => ({
          ...a,
          expanded: i === 0,
          selectedClientId: null,
          colorClass: ['av-teal', 'av-blue', 'av-amber'][i % 3],
          initials: this.getInitials(a.name ?? '?')
        }));
        this.calcStats();
      },
      error: () => this.loadMock()
    });
  }

  loadUnassigned(): void {
    this.http.get<UnassignedClient[]>(`${environment.apiUrl}/supervisor/clients/unassigned`).subscribe({
      next: (data) => { this.unassignedClients = data ?? []; },
      error: () => {}
    });
  }

  private loadMissions(): void {
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.get<Mission[]>(`${environment.apiUrl}/supervisor/missions/active?userId=${userId}`).subscribe({
      next: (data) => { this.activeMissions = data; this.stats.activeMissions = data.length; },
      error: () => {}
    });
  }

  private loadMock(): void {
    this.supervisorName = localStorage.getItem('username') ?? 'Superviseur';
    this.supervisorInitials = this.getInitials(this.supervisorName);
    this.department = 'Operations Sousse';
    this.agents = [
      { agentId: 1, userId: 7, name: 'agent1', speciality: 'Transport', isActive: true, clientCount: 0, clients: [], expanded: true, selectedClientId: null },
      { agentId: 2, userId: 8, name: 'agent2', speciality: 'Livraison', isActive: true, clientCount: 0, clients: [], expanded: false, selectedClientId: null },
    ];
    this.calcStats();
  }

  private calcStats(): void {
    this.stats.totalAgents = this.agents.length;
    this.stats.totalClients = this.agents.reduce((s, a) => s + (a.clients?.length ?? 0), 0);
  }

  toggleAgent(agent: Agent): void {
    agent.expanded = !agent.expanded;
  }

  assignClient(agent: Agent): void {
    if (!agent.selectedClientId) return;
    this.http.post(`${environment.apiUrl}/supervisor/assign/by-id`, {
      agentId: agent.agentId,
      custId: agent.selectedClientId
    }).subscribe({
      next: () => {
        agent.selectedClientId = null;
        this.loadDashboard();
        this.loadUnassigned();
      },
      error: () => {}
    });
  }

  unassignClient(agent: Agent, client: AssignedClient): void {
    this.http.delete(`${environment.apiUrl}/supervisor/assign/${agent.agentId}/${client.custId}`).subscribe({
      next: () => { this.loadDashboard(); this.loadUnassigned(); },
      error: () => {}
    });
  }

  getMissionLabel(s: string): string {
    return ({ active: 'En mission', idle: 'Disponible', pending: 'En attente' } as any)[s] ?? s;
  }

  getPillClass(s: string): string {
    return ({ active: 'pill-active', idle: 'pill-idle', pending: 'pill-pending' } as any)[s] ?? 'pill-idle';
  }

  getMissionActive(agent: Agent): number {
    return (agent.clients ?? []).filter(c => c.missionStatus === 'active').length;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  getTypeLabel(t: string): string {
    return ({ STANDARD: 'Standard', VIP: 'VIP', ETUDIANT: 'Étudiant', MINEUR: 'Mineur', SPORTIF: 'Sportif', PREPAID: 'Prépayé' } as any)[t] ?? t;
  }
}
