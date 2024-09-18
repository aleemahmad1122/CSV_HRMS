import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPurchaseInvoicesComponent } from './view-purchase-invoices.component';

describe('ViewPurchaseInvoicesComponent', () => {
  let component: ViewPurchaseInvoicesComponent;
  let fixture: ComponentFixture<ViewPurchaseInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPurchaseInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPurchaseInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
