import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBankPurchaseReceiptComponent } from './view-bank-purchase-receipt.component';

describe('ViewBankPurchaseReceiptComponent', () => {
  let component: ViewBankPurchaseReceiptComponent;
  let fixture: ComponentFixture<ViewBankPurchaseReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBankPurchaseReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBankPurchaseReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
