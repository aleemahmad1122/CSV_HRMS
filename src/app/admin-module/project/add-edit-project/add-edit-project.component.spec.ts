import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditProjectComponent } from './add-edit-project.component';

describe('AddEditProjectComponent', () => {
  let component: AddEditProjectComponent;
  let fixture: ComponentFixture<AddEditProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
