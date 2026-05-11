import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'balanceFormat', standalone: true })
export class BalanceFormatPipe implements PipeTransform {
  transform(value?: number): string {
    if (value === undefined || value === null) return '0.00 DT';
    return `${value.toFixed(2)} DT`;
  }
}
