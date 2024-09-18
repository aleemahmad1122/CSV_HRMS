import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StickyToolbarComponent } from './sticky-toolbar.component';

describe('StickyToolbarComponent', () => {
  let component: StickyToolbarComponent;
  let fixture: ComponentFixture<StickyToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StickyToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StickyToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
