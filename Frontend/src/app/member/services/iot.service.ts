import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IotData {
  iotId: number;
  custId: number;
  latitude: number;
  longitude: number;
  speed: number;
  battery: number;
  temperature: number;
  obstacle: number;
  locked: number;
  receivedAt: string;
}

export interface CdrLog {
  custId: number;
  serviceId: number;
  sessionStart: string;
  sessionEnd: string;
  durationMin: number;
  distanceKm: number;
  wifiMb: number;
  passengersCount: number;
  optionsActivated: string;
  ecodriving: number;
  rawAmount: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class IotService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLatestPosition(custId: number): Observable<IotData> {
    return this.http.get<IotData>(`${this.apiUrl}/iot/data/customer/${custId}/latest`);
  }

  saveCdr(cdr: CdrLog): Observable<any> {
    return this.http.post(`${this.apiUrl}/cdr-logs`, cdr);
  }
}