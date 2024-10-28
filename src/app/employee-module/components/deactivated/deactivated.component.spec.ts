import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivatedComponent } from './deactivated.component';

describe('DeactivatedComponent', () => {
  let component: DeactivatedComponent;
  let fixture: ComponentFixture<DeactivatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeactivatedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeactivatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
