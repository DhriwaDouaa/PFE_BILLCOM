import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="text-center py-3 text-muted small border-top mt-auto">
      <i class="bi bi-car-front-fill text-info me-1"></i>
      PFE SmartCar &copy; 2026 — Spring Boot + Oracle TimesTen + Angular 17
    </footer>
  `
})
export class FooterComponent {}
