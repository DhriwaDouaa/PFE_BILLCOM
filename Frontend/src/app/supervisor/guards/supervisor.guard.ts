import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const supervisorGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role');
  console.log('Guard role:', role); console.log('Guard role:', role); if (role === 'SUPERVISOR') return true;
  router.navigate(['/login']);
  return false;
};
