import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface StatCard { label: string; value: string; icon: string; color: string; }

@Component({
  selector: 'app-supervisor-rapports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-rapports.component.html',
  styleUrls: ['./supervisor-rapports.component.css']
})
export class SupervisorRapportsComponent implements OnInit {

  stats: StatCard[] = [];
  cdrLogs: any[] = [];
  loading = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMock();
  }

  loadMock(): void {
    this.stats = [
      { label: 'Missions aujourd\'hui', value: '12', icon: 'bi-car-front-fill', color: 'green' },
      { label: 'Revenus aujourd\'hui', value: '48.750 DT', icon: 'bi-cash-stack', color: 'blue' },
      { label: 'Distance totale', value: '87.4 km', icon: 'bi-geo-alt-fill', color: 'amber' },
      { label: 'Clients actifs', value: '7', icon: 'bi-people-fill', color: 'purple' },
    ];
    this.cdrLogs = [
      { cdrId: 1, agent: 'Karim Trabelsi', client: 'Ahmed Ben Ali', distance: 3.2, duration: 8, amount: 2.880, status: 'BILLED' },
      { cdrId: 2, agent: 'Sarra Boughzala', client: 'Leila Mansour', distance: 1.7, duration: 4, amount: 1.530, status: 'BILLED' },
      { cdrId: 3, agent: 'Karim Trabelsi', client: 'Omar Mejri', distance: 5.1, duration: 14, amount: 4.590, status: 'BILLED' },
      { cdrId: 4, agent: 'Sarra Boughzala', client: 'Youssef Chaabane', distance: 2.3, duration: 6, amount: 2.070, status: 'PENDING' },
    ];
  }
}
