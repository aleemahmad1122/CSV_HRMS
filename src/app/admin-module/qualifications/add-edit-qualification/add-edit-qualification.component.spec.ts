import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditQualificationComponent } from './add-edit-qualification.component';

describe('AddEditQualificationComponent', () => {
  let component: AddEditQualificationComponent;
  let fixture: ComponentFixture<AddEditQualificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditQualificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditQualificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
