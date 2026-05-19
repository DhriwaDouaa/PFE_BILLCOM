import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Client {
  custId: number;
  name: string;
  phone: string;
  clientType: string;
  status: string;
  balance: number;
  agentName: string;
  missionStatus: string;
}

@Component({
  selector: 'app-supervisor-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supervisor-clients.component.html',
  styleUrls: ['./supervisor-clients.component.css']
})
export class SupervisorClientsComponent implements OnInit {

  clients: Client[] = [];
  filtered: Client[] = [];
  loading = false;
  search = '';
  filterType = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    const userId = localStorage.getItem('userId') ?? '0';
    this.http.get<any>(`${environment.apiUrl}/supervisor/clients?userId=${userId}`).subscribe({
      next: (data) => { this.loading = false; this.clients = data ?? []; this.applyFilter(); },
      error: () => { this.loading = false; this.loadMock(); }
    });
  }

  private loadMock(): void {
    this.clients = [
      { custId: 1, name: 'Ahmed Ben Ali', phone: '+216 20 123 456', clientType: 'STANDARD', status: 'ACTIVE', balance: 15.500, agentName: 'Karim Trabelsi', missionStatus: 'idle' },
      { custId: 2, name: 'Fatma Riahi', phone: '+216 55 987 654', clientType: 'VIP', status: 'ACTIVE', balance: 42.000, agentName: 'Karim Trabelsi', missionStatus: 'idle' },
      { custId: 3, name: 'Omar Mejri', phone: '+216 98 456 123', clientType: 'STANDARD', status: 'ACTIVE', balance: 8.200, agentName: 'Karim Trabelsi', missionStatus: 'pending' },
      { custId: 4, name: 'Leila Mansour', phone: '+216 22 111 222', clientType: 'VIP', status: 'ACTIVE', balance: 30.000, agentName: 'Sarra Boughzala', missionStatus: 'active' },
      { custId: 5, name: 'Youssef Chaabane', phone: '+216 50 333 444', clientType: 'STANDARD', status: 'ACTIVE', balance: 5.750, agentName: 'Sarra Boughzala', missionStatus: 'idle' },
      { custId: 6, name: 'Nour Ben Romdhane', phone: '+216 25 555 666', clientType: 'STANDARD', status: 'ACTIVE', balance: 12.300, agentName: 'Sarra Boughzala', missionStatus: 'idle' },
      { custId: 7, name: 'Walid Bouazizi', phone: '+216 21 999 000', clientType: 'VIP', status: 'ACTIVE', balance: 88.000, agentName: 'Rami Gharbi', missionStatus: 'idle' },
    ];
    this.applyFilter();
  }

  applyFilter(): void {
    this.filtered = this.clients.filter(c => {
      const matchSearch = !this.search || c.name.toLowerCase().includes(this.search.toLowerCase()) || c.phone.includes(this.search);
      const matchType = !this.filterType || c.clientType === this.filterType;
      return matchSearch && matchType;
    });
  }

  getMissionLabel(s: string): string {
    return { active: 'En mission', idle: 'Disponible', pending: 'En attente' }[s] ?? s;
  }

  getPillClass(s: string): string {
    return { active: 'pill-active', idle: 'pill-idle', pending: 'pill-pending' }[s] ?? 'pill-idle';
  }

  getInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }
}
