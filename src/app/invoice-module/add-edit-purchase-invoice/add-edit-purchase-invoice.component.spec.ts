import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPurchaseInvoiceComponent } from './add-edit-purchase-invoice.component';

describe('AddEditPurchaseInvoiceComponent', () => {
  let component: AddEditPurchaseInvoiceComponent;
  let fixture: ComponentFixture<AddEditPurchaseInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditPurchaseInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditPurchaseInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
