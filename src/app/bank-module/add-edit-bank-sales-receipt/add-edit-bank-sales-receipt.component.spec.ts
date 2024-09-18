import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBankSalesReceiptComponent } from './add-edit-bank-sales-receipt.component';

describe('AddEditBankSalesReceiptComponent', () => {
  let component: AddEditBankSalesReceiptComponent;
  let fixture: ComponentFixture<AddEditBankSalesReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditBankSalesReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditBankSalesReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
