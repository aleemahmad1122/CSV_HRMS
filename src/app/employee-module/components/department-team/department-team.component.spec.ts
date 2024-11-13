import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentTeamComponent } from './department-team.component';

describe('DepartmentTeamComponent', () => {
  let component: DepartmentTeamComponent;
  let fixture: ComponentFixture<DepartmentTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
