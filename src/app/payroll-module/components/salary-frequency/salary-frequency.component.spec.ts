import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryFrequencyComponent } from './salary-frequency.component';

describe('SalaryFrequencyComponent', () => {
  let component: SalaryFrequencyComponent;
  let fixture: ComponentFixture<SalaryFrequencyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaryFrequencyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryFrequencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
