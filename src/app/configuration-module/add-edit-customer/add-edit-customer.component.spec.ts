import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditCustomerComponent } from './add-edit-customer.component';

describe('AddEditCustomerComponent', () => {
  let component: AddEditCustomerComponent;
  let fixture: ComponentFixture<AddEditCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
