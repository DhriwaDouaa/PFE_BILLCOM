import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CdrService {
  private url = 'http://localhost:8080/api/cdr-logs';

  constructor(private http: HttpClient) {}

  getByCustId(custId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/customer/${custId}`);
  }
}