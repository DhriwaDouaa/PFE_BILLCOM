import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Customer } from '../models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private endpoint = 'customers';
  constructor(private api: ApiService) {}
  getAll(): Observable<Customer[]> { return this.api.get<Customer[]>(this.endpoint); }
  getById(id: number): Observable<Customer> { return this.api.get<Customer>(`${this.endpoint}/${id}`); }
  create(customer: Customer): Observable<Customer> { return this.api.post<Customer>(this.endpoint, customer); }
  update(id: number, customer: Customer): Observable<Customer> { return this.api.put<Customer>(`${this.endpoint}/${id}`, customer); }
  delete(id: number): Observable<void> { return this.api.delete<void>(`${this.endpoint}/${id}`); }
}
