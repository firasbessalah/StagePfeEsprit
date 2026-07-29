import { ComponentFixture, TestBed } from '@angular/core/testing';

import { importProvidersFrom } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslationService } from 'src/app/core/services/translation.service';
import { FavorisComponent } from './favoris';

describe('FavorisComponent', () => {
  let component: FavorisComponent;
  let fixture: ComponentFixture<FavorisComponent>;

  beforeEach(async () => {
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['currentLang', 'setLanguage', 'translate']);
    translationServiceSpy.currentLang.and.returnValue('fr');
    translationServiceSpy.translate.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [FavorisComponent],
      providers: [
        importProvidersFrom(RouterModule.forRoot([])),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: TranslationService, useValue: translationServiceSpy }
      ]
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
