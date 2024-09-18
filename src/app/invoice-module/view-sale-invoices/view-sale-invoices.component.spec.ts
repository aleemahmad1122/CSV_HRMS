import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSaleInvoicesComponent } from './view-sale-invoices.component';

describe('ViewSaleInvoicesComponent', () => {
  let component: ViewSaleInvoicesComponent;
  let fixture: ComponentFixture<ViewSaleInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSaleInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSaleInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
