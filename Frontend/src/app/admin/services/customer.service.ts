import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { Customer } from '../../shared/models/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService extends ApiService {
  private endpoint = 'customers';

  getAllCustomers(): Observable<Customer[]> {
    return this.get<Customer[]>(this.endpoint);
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.get<Customer>(`${this.endpoint}/${id}`);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.post<Customer>(this.endpoint, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.put<Customer>(`${this.endpoint}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
