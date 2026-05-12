import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../../shared/models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private url = '/api/payments';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.url);
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.url}/${id}`);
  }

  getByCustomer(custId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.url}/customer/${custId}`);
  }

  create(p: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.url, p);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}