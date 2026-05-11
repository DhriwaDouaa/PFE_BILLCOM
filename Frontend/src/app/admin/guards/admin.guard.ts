import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  // TODO: implement real auth check
  // const authService = inject(AuthService);
  // if (!authService.isAdmin()) inject(Router).navigate(['/']);
  return true;
};
