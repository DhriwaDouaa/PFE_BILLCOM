import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vehicle } from '../models/member.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  // Mock data - replace with real API calls
  private vehicles: Vehicle[] = [
    { id: 1, brand: 'Toyota', model: 'Corolla', licensePlate: '100 TUN 1234', year: 2022 },
    { id: 2, brand: 'Renault', model: 'Clio', licensePlate: '200 TUN 5678', year: 2021 },
  ];

  getVehicles(): Observable<Vehicle[]> {
    return of(this.vehicles);
  }
}
