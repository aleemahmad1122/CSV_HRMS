import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExpenseSheetComponent } from './view-expense-sheet.component';

describe('ViewExpenseSheetComponent', () => {
  let component: ViewExpenseSheetComponent;
  let fixture: ComponentFixture<ViewExpenseSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewExpenseSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewExpenseSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
