import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../../shared/models/invoice.model';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private url = '/api/invoices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.url);
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.url}/${id}`);
  }

  getByCustomer(custId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.url}/customer/${custId}`);
  }

  create(i: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.url, i);
  }

  update(id: number, i: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.url}/${id}`, i);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}