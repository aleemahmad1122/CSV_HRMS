import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditBankComponent } from './add-edit-bank.component';

describe('AddEditBankComponent', () => {
  let component: AddEditBankComponent;
  let fixture: ComponentFixture<AddEditBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditBankComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
