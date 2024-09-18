import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditExpenseSheetComponent } from './add-edit-expense-sheet.component';

describe('AddEditExpenseSheetComponent', () => {
  let component: AddEditExpenseSheetComponent;
  let fixture: ComponentFixture<AddEditExpenseSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditExpenseSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditExpenseSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
