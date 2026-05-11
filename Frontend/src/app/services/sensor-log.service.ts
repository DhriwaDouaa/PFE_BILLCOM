import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { SensorLog } from '../models/sensor-log.model';

@Injectable({ providedIn: 'root' })
export class SensorLogService {
  private endpoint = 'sensor-logs';
  constructor(private api: ApiService) {}
  getAll(): Observable<SensorLog[]> { return this.api.get<SensorLog[]>(this.endpoint); }
  getById(id: number): Observable<SensorLog> { return this.api.get<SensorLog>(`${this.endpoint}/${id}`); }
  create(log: SensorLog): Observable<SensorLog> { return this.api.post<SensorLog>(this.endpoint, log); }
  delete(id: number): Observable<void> { return this.api.delete<void>(`${this.endpoint}/${id}`); }
}
