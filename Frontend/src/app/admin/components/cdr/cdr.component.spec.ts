import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CdrComponent } from './cdr.component';

describe('CdrComponent', () => {
  let component: CdrComponent;
  let fixture: ComponentFixture<CdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CdrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
