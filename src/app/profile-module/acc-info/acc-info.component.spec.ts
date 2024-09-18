import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccInfoComponent } from './acc-info.component';

describe('AccInfoComponent', () => {
  let component: AccInfoComponent;
  let fixture: ComponentFixture<AccInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
