import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../shared/services/api.service';

@Injectable({ providedIn: 'root' })
export class HealthService extends ApiService {
  checkHealth(): Observable<any> {
    return this.get<any>('health');
  }
}
