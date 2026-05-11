import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';
import { SensorLog } from '../../shared/models/sensor-log.model';

@Injectable({ providedIn: 'root' })
export class SensorLogService extends ApiService {
  private endpoint = 'sensor-logs';

  getAllLogs(): Observable<SensorLog[]> {
    return this.get<SensorLog[]>(this.endpoint);
  }

  getLogById(id: number): Observable<SensorLog> {
    return this.get<SensorLog>(`${this.endpoint}/${id}`);
  }

  createLog(log: SensorLog): Observable<SensorLog> {
    return this.post<SensorLog>(this.endpoint, log);
  }

  deleteLog(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
