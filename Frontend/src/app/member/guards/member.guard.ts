import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const memberGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'MEMBER') {
    return true;
  }

  router.navigate(['/login']);
  return false;
};