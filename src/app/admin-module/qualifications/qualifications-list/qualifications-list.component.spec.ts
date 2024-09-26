import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QualificationsListComponent } from './qualifications-list.component';

describe('QualificationsListComponent', () => {
  let component: QualificationsListComponent;
  let fixture: ComponentFixture<QualificationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QualificationsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QualificationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
