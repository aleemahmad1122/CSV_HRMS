import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAddEditComponent } from './role-add-edit.component';

describe('RoleAddEditComponent', () => {
  let component: RoleAddEditComponent;
  let fixture: ComponentFixture<RoleAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
