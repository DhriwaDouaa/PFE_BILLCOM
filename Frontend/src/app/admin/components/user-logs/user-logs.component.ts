import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-logs.component.html',
  styleUrl: './user-logs.component.css'
})
export class UserLogsComponent implements OnInit {
  logs: any[] = [];
  filteredLogs: any[] = [];
  loading = true;
  searchTerm = '';
  selectedRole = '';
  selectedAction = '';
  currentRole = localStorage.getItem('role') || '';
  currentUserId = parseInt(localStorage.getItem('userId') || '0');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8080/api/user-logs').subscribe({
      next: (data) => {
        // SUPERVISOR voit seulement les logs de son équipe (agents)
        if (this.currentRole === 'SUPERVISOR') {
          this.logs = data.filter(l =>
            l.role === 'AGENT' || l.userId === this.currentUserId
          );
        } else {
          this.logs = data;
        }
        this.filteredLogs = this.logs;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const role = this.selectedRole;
    const action = this.selectedAction;

    this.filteredLogs = this.logs.filter(l => {
      const matchName = l.username?.toLowerCase().includes(term);
      const matchIp = l.ipAddress?.includes(term);
      const matchRole = role ? l.role === role : true;
      const matchAction = action ? l.action === action : true;
      return (matchName || matchIp) && matchRole && matchAction;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedAction = '';
    this.filteredLogs = this.logs;
  }

  getLoginCount(): number {
    return this.filteredLogs.filter(l => l.action === 'LOGIN').length;
  }

  getLogoutCount(): number {
    return this.filteredLogs.filter(l => l.action === 'LOGOUT').length;
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bg-danger';
      case 'SUPERVISOR': return 'bg-warning text-dark';
      case 'AGENT': return 'bg-primary';
      case 'MEMBER': return 'bg-info';
      default: return 'bg-secondary';
    }
  }

  getActionBadgeClass(action: string): string {
    return action === 'LOGIN' ? 'bg-success' : 'bg-danger';
  }

  getActionIcon(action: string): string {
    return action === 'LOGIN' ? 'bi-box-arrow-in-right' : 'bi-box-arrow-right';
  }
  getUniqueUsers(): number {
  const ids = this.filteredLogs.map(l => l.userId);
  return [...new Set(ids)].length;
}
}
