import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditSaleInvoiceComponent } from './add-edit-sale-invoice.component';

describe('AddEditSaleInvoiceComponent', () => {
  let component: AddEditSaleInvoiceComponent;
  let fixture: ComponentFixture<AddEditSaleInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditSaleInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditSaleInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
