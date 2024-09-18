import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickCartComponent } from './quick-cart.component';

describe('QuickCartComponent', () => {
  let component: QuickCartComponent;
  let fixture: ComponentFixture<QuickCartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickCartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
