import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBanksComponent } from './view-banks.component';

describe('ViewBanksComponent', () => {
  let component: ViewBanksComponent;
  let fixture: ComponentFixture<ViewBanksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewBanksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
