import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertesComponent } from './alertes';

describe('AlertesComponent', () => {
  let component: AlertesComponent;
  let fixture: ComponentFixture<AlertesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
