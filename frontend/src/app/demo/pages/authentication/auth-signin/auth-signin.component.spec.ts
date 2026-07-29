import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { AuthSigninComponent } from './auth-signin.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

describe('AuthSigninComponent', () => {
  let component: AuthSigninComponent;
  let fixture: ComponentFixture<AuthSigninComponent>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'getDefaultRouteForRole']);
    const translationServiceSpy = jasmine.createSpyObj('TranslationService', ['currentLang', 'setLanguage', 'translate']);
    const activatedRouteSpy = {
      snapshot: {
        queryParamMap: {
          get: () => null
        }
      }
    };

    translationServiceSpy.currentLang.and.returnValue('fr');
    translationServiceSpy.translate.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [AuthSigninComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
        importProvidersFrom(RouterModule.forRoot([])),
        { provide: ActivatedRoute, useValue: activatedRouteSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuthSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when form fields are empty', () => {
    component.loginModal.set({ email: '', password: '' });
    fixture.detectChanges();
    
    expect(component.loginForm.email().invalid()).toBeTrue();
    expect(component.loginForm.password().errors().length).toBeGreaterThan(0);
  });

  it('should be valid when fields are filled correctly', () => {
    component.loginModal.set({ email: 'test@example.com', password: 'password123' });
    fixture.detectChanges();
    
    expect(component.loginForm.email().invalid()).toBeFalse();
    expect(component.loginForm.password().errors().length).toBe(0);
  });
});
