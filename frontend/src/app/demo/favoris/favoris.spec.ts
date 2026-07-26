import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavorisComponent } from './favoris';

describe('FavorisComponent', () => {
  let component: FavorisComponent;
  let fixture: ComponentFixture<FavorisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavorisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavorisComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
