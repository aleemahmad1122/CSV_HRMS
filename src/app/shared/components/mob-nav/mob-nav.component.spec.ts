import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobNavComponent } from './mob-nav.component';

describe('MobNavComponent', () => {
  let component: MobNavComponent;
  let fixture: ComponentFixture<MobNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
