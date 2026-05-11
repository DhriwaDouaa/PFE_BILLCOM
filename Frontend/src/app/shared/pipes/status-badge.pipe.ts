import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'statusBadge', standalone: true })
export class StatusBadgePipe implements PipeTransform {
  transform(status?: string): string {
    switch (status) {
      case 'NORMAL': return 'bg-success';
      case 'WARNING': return 'bg-warning text-dark';
      case 'CRITICAL': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
