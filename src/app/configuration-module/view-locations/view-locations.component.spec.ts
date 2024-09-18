import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLocationsComponent } from './view-locations.component';

describe('ViewLocationsComponent', () => {
  let component: ViewLocationsComponent;
  let fixture: ComponentFixture<ViewLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewLocationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
