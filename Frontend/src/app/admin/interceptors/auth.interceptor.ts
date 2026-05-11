import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add auth token if needed
  const token = localStorage.getItem('token');
  if (token) {
    const cloned = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
    return next(cloned);
  }
  return next(req);
};
