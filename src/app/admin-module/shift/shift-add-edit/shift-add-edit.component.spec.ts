import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftAddEditComponent } from './shift-add-edit.component';

describe('ShiftAddEditComponent', () => {
  let component: ShiftAddEditComponent;
  let fixture: ComponentFixture<ShiftAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShiftAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShiftAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
