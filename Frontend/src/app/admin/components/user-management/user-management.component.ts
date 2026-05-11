import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  loading = true;
  showModal = false;
  editMode = false;
  saving = false;
  message = '';
  msgType = 'success';
  searchTerm = '';
  selectedRole = '';

  form: any = {
    username: '',
    email: '',
    password: '',
    role: 'AGENT',
    custId: null
  };
  editId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<any[]>('http://localhost:8080/api/users').subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search() {
    const term = this.searchTerm.toLowerCase().trim();
    const role = this.selectedRole;

    this.filteredUsers = this.users.filter(u => {
      const matchName = u.username?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      const matchRole = role ? u.role === role : true;
      return (matchName || matchEmail) && matchRole;
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedRole = '';
    this.filteredUsers = this.users;
  }

  openModal() {
    this.editMode = false;
    this.form = { username: '', email: '', password: '', role: 'AGENT', custId: null };
    this.showModal = true;
  }

  edit(user: any) {
    this.editMode = true;
    this.editId = user.userId;
    this.form = {
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      custId: user.custId
    };
    this.showModal = true;
  }

  save() {
    if (!this.form.username || !this.form.email || !this.form.password) return;
    this.saving = true;

    const obs = this.editMode
      ? this.http.put(`http://localhost:8080/api/users/${this.editId}`, this.form)
      : this.http.post('http://localhost:8080/api/users', this.form);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.load();
        this.alert(this.editMode ? 'Utilisateur modifié !' : 'Utilisateur créé !', 'success');
      },
      error: () => {
        this.saving = false;
        this.alert('Erreur sauvegarde', 'error');
      }
    });
  }

  delete(userId: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.http.delete(`http://localhost:8080/api/users/${userId}`).subscribe({
      next: () => { this.load(); this.alert('Supprimé !', 'success'); },
      error: () => this.alert('Erreur suppression', 'error')
    });
  }

  closeModal() { this.showModal = false; }

  alert(msg: string, type: string) {
    this.message = msg;
    this.msgType = type;
    setTimeout(() => this.message = '', 3000);
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

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ADMIN': return 'bi-shield-fill';
      case 'SUPERVISOR': return 'bi-eye-fill';
      case 'AGENT': return 'bi-person-badge-fill';
      case 'MEMBER': return 'bi-person-fill';
      default: return 'bi-person';
    }
  }
  getCount(role: string): number {
  return this.users.filter(u => u.role === role).length;
}
}
