import { Routes } from '@angular/router';
import { adminGuard } from './admin/guards/admin.guard';
import { memberGuard } from './member/guards/member.guard';
import { supervisorGuard } from './supervisor/guards/supervisor.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'admin', canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./admin/components/dashboard/dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'customers', loadComponent: () => import('./admin/components/customers/customers.component').then(m => m.AdminCustomersComponent) },
      { path: 'customer-detail/:id', loadComponent: () => import('./admin/components/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent) },
      { path: 'health', loadComponent: () => import('./admin/components/health/health.component').then(m => m.AdminHealthComponent) },
      { path: 'services', loadComponent: () => import('./admin/components/services/services.component').then(m => m.ServicesComponent) },
      { path: 'invoices', loadComponent: () => import('./admin/components/invoices/invoices.component').then(m => m.InvoicesComponent) },
      { path: 'payments', loadComponent: () => import('./admin/components/payments/payments.component').then(m => m.PaymentsComponent) },
      { path: 'cdr', loadComponent: () => import('./admin/components/cdr/cdr.component').then(m => m.CdrComponent) },
      { path: 'user-management', loadComponent: () => import('./admin/components/user-management/user-management.component').then(m => m.UserManagementComponent) },
      { path: 'user-logs', loadComponent: () => import('./admin/components/user-logs/user-logs.component').then(m => m.UserLogsComponent) },
      { path: 'subscriptions', loadComponent: () => import('./admin/components/subscriptions/subscriptions.component').then(m => m.AdminSubscriptionsComponent) },
    ]
  },
  {
    path: 'member', canActivate: [memberGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', loadComponent: () => import('./member/components/profile/profile.component').then(m => m.MemberProfileComponent) },
      { path: 'vehicules', loadComponent: () => import('./member/components/vehicules/vehicules.component').then(m => m.VehiculesComponent) },
      { path: 'verification', loadComponent: () => import('./member/components/verification/verification.component').then(m => m.VerificationComponent) },
      { path: 'recharge', loadComponent: () => import('./member/components/recharge/recharge.component').then(m => m.RechargeComponent) },
      { path: 'factures', loadComponent: () => import('./member/components/factures/factures.component').then(m => m.FacturesComponent) },
      { path: 'abonnements', loadComponent: () => import('./member/components/abonnements/abonnements.component').then(m => m.AbonnementsComponent) },
      { path: 'mes-services', loadComponent: () => import('./member/components/mes-services/mes-services.component').then(m => m.MesServicesComponent) },
      { path: 'vehicle-control', loadComponent: () => import('./member/components/vehicle-control/vehicle-control.component').then(m => m.VehicleControlComponent) }
    ]
  },
  {
    path: 'supervisor', canActivate: [supervisorGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./supervisor/components/supervisor-dashboard/supervisor-dashboard.component').then(m => m.SupervisorDashboardComponent) },
      { path: 'agents', loadComponent: () => import('./supervisor/components/supervisor-agents/supervisor-agents.component').then(m => m.SupervisorAgentsComponent) },
      { path: 'clients', loadComponent: () => import('./supervisor/components/supervisor-clients/supervisor-clients.component').then(m => m.SupervisorClientsComponent) },
      { path: 'rapports', loadComponent: () => import('./supervisor/components/supervisor-rapports/supervisor-rapports.component').then(m => m.SupervisorRapportsComponent) },
    ]
  },
  {
    path: 'agent',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./agent/components/agent-dashboard/agent-dashboard.component').then(m => m.AgentDashboardComponent) },
      { path: 'vehicules', loadComponent: () => import('./member/components/vehicules/vehicules.component').then(m => m.VehiculesComponent) },
      { path: 'vehicle-control', loadComponent: () => import('./member/components/vehicle-control/vehicle-control.component').then(m => m.VehicleControlComponent) }
    ]
  },
  { path: 'settings', children: [{ path: 'password', loadComponent: () => import('./settings/change-password/change-password.component').then(m => m.ChangePasswordComponent) }] },
  { path: '**', redirectTo: 'login' },
];