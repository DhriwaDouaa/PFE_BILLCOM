import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private apiUrl = `${environment.apiUrl}/health`;

  constructor(private http: HttpClient) {}

  check(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
