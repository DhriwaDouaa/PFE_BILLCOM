import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const verificationGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const custId = localStorage.getItem('custId');
  const role = localStorage.getItem('role');

  // Si mtech member — mtech concerné
  if (role !== 'MEMBER') return true;

  // Si mtech logged in
  if (!custId) {
    router.navigate(['/login']);
    return false;
  }

  // Check verification status
  return http.get<any>(`${environment.apiUrl}/customers/${custId}`).pipe(
    map(customer => {
      if (customer.verificationStatus === 'VERIFIED') {
        return true;
      } else {
        router.navigate(['/member/profile'], {
          queryParams: { verificationRequired: true }
        });
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/member/profile']);
      return of(false);
    })
  );
};