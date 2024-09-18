import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickPanelComponent } from './quick-panel.component';

describe('QuickPanelComponent', () => {
  let component: QuickPanelComponent;
  let fixture: ComponentFixture<QuickPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
