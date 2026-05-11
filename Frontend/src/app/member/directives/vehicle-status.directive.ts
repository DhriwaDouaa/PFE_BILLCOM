import { Directive, Input, ElementRef, OnInit } from '@angular/core';

@Directive({ selector: '[appVehicleStatus]', standalone: true })
export class VehicleStatusDirective implements OnInit {
  @Input() appVehicleStatus: 'active' | 'inactive' = 'active';
  constructor(private el: ElementRef) {}
  ngOnInit() {
    this.el.nativeElement.style.borderLeft = this.appVehicleStatus === 'active' ? '4px solid #198754' : '4px solid #dc3545';
  }
}
