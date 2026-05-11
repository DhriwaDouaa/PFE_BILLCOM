import { HttpInterceptorFn } from '@angular/common/http';

export const memberInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
