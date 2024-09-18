import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoPanelComponent } from './demo-panel.component';

describe('DemoPanelComponent', () => {
  let component: DemoPanelComponent;
  let fixture: ComponentFixture<DemoPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
