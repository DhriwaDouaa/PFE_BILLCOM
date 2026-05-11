import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({ selector: '[appHasRole]', standalone: true })
export class HasRoleDirective {
  @Input() set appHasRole(role: string) {
    // TODO: check user role from auth service
    this.viewContainer.createEmbeddedView(this.templateRef);
  }
  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}
}
