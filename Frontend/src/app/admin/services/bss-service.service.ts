import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../../shared/models/service.model';

@Injectable({ providedIn: 'root' })
export class BssServiceService {
  private url = 'http://localhost:8080/api/services';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.url);
  }

  getById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.url}/${id}`);
  }

  create(s: Service): Observable<Service> {
    return this.http.post<Service>(this.url, s);
  }

  update(id: number, s: Service): Observable<Service> {
    return this.http.put<Service>(`${this.url}/${id}`, s);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}