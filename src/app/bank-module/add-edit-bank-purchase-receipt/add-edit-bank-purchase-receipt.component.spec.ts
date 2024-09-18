import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBankPurchaseReceiptComponent } from './add-edit-bank-purchase-receipt.component';

describe('AddEditBankPurchaseReceiptComponent', () => {
  let component: AddEditBankPurchaseReceiptComponent;
  let fixture: ComponentFixture<AddEditBankPurchaseReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditBankPurchaseReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditBankPurchaseReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
