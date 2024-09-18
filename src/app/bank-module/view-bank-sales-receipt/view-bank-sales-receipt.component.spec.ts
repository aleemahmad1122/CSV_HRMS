import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBankSalesReceiptComponent } from './view-bank-sales-receipt.component';

describe('ViewBankSalesReceiptComponent', () => {
  let component: ViewBankSalesReceiptComponent;
  let fixture: ComponentFixture<ViewBankSalesReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBankSalesReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBankSalesReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
