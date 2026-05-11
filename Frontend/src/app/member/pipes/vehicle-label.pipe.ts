import { Pipe, PipeTransform } from '@angular/core';
import { Vehicle } from '../models/member.model';

@Pipe({ name: 'vehicleLabel', standalone: true })
export class VehicleLabelPipe implements PipeTransform {
  transform(v: Vehicle): string {
    return v ? `${v.brand} ${v.model} (${v.year})` : '';
  }
}
