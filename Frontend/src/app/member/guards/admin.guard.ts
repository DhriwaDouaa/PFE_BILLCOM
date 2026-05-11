import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'ADMIN' || role === 'SUPERVISOR' || role === 'AGENT') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};