import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Agent {
  agentId: number;
  userId: number;
  name: string;
  email: string;
  speciality: string;
  isActive: boolean;
  clientCount: number;
  hiredAt: string;
}

@Component({
  selector: 'app-supervisor-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-agents.component.html',
  styleUrls: ['./supervisor-agents.component.css']
})
export class SupervisorAgentsComponent implements OnInit {

  agents: Agent[] = [];
  loading = false;
  showAddForm = false;

  newAgent = {
    username: '',
    email: '',
    password: '',
    speciality: ''
  };
  addError = '';
  addLoading = false;
  addSuccess = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.loading = true;
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.get<any>(`${environment.apiUrl}/supervisor/agents/full?userId=${userId}`).subscribe({
      next: (data) => {
        this.loading = false;
        this.agents = data ?? [];
      },
      error: () => {
        this.loading = false;
        this.loadMock();
      }
    });
  }

  private loadMock(): void {
    this.agents = [
      { agentId: 1, userId: 7, name: 'Karim Trabelsi', email: 'agent1@bss.com', speciality: 'Transport', isActive: true, clientCount: 3, hiredAt: '2026-01-15' },
      { agentId: 2, userId: 8, name: 'Sarra Boughzala', email: 'agent2@bss.com', speciality: 'Livraison', isActive: true, clientCount: 4, hiredAt: '2026-02-01' },
    ];
  }

  toggleAgent(agent: Agent): void {
    agent.isActive = !agent.isActive;
    this.http.patch(`${environment.apiUrl}/agent/${agent.agentId}/status`, { isActive: agent.isActive }).subscribe();
  }

  addAgent(): void {
    if (!this.newAgent.username || !this.newAgent.email || !this.newAgent.password || !this.newAgent.speciality) {
      this.addError = 'Veuillez remplir tous les champs';
      return;
    }
    this.addLoading = true;
    this.addError = '';
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.post(`${environment.apiUrl}/supervisor/agents/add?userId=${userId}`, this.newAgent).subscribe({
      next: () => {
        this.addLoading = false;
        this.addSuccess = true;
        this.newAgent = { username: '', email: '', password: '', speciality: '' };
        setTimeout(() => { this.addSuccess = false; this.showAddForm = false; this.loadAgents(); }, 2000);
      },
      error: () => {
        this.addLoading = false;
        this.addError = 'Erreur lors de la création';
      }
    });
  }

  getInitials(name: string): string {
    return (name || '??').split(' ').map((w:string) => w[0]).join('').substring(0, 2).toUpperCase();  }
}
