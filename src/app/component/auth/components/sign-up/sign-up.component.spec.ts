import { async, ComponentFixture, TestBed, inject, fakeAsync, flush, discardPeriodicTasks } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, AuthServiceConfig, LoginOpt, SocialUser } from 'angularx-social-login';
import { Observable, of, throwError } from 'rxjs';
import { UserOwnSignUpService } from '@global-service/auth/user-own-sign-up.service';
import { UserSuccessSignIn } from '@global-models/user-success-sign-in';
import { GoogleSignInService } from '@global-service/auth/google-sign-in.service';
import { SubmitEmailComponent } from '@global-auth/submit-email/submit-email.component';
import { provideConfig } from 'src/app/config/GoogleAuthConfig';
import { SignUpComponent } from './sign-up.component';
import { LocalStorageService } from '@global-service/localstorage/local-storage.service';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatSnackBarComponent } from '@global-errors/mat-snack-bar/mat-snack-bar.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authServiceMock: AuthService;
  let MatSnackBarMock: MatSnackBarComponent;
  const routerSpy = { navigate: jasmine.createSpy('navigate') };
  class MatDialogRefMock {
    close() { }
  }

  const promiseSocialUser = new Promise<SocialUser>((resolve) => {
    const val = new SocialUser();
    val.email = '1';
    val.firstName = '1';
    val.authorizationCode = '1';
    val.id = '1';
    val.name = '1';
    val.photoUrl = '1';
    val.authToken = '1';
    resolve(val);
  });
  authServiceMock = jasmine.createSpyObj('AuthService', ['signIn']);
  authServiceMock.signIn = (providerId: string, opt?: LoginOpt) => promiseSocialUser;

  MatSnackBarMock = jasmine.createSpyObj('MatSnackBarComponent', ['openSnackBar']);
  MatSnackBarMock.openSnackBar = (type: string) =>  { };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SignUpComponent,
        SubmitEmailComponent,
      ],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        AgmCoreModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatDialogRef, useClass: MatDialogRefMock },
        { provide: AuthServiceConfig, useFactory: provideConfig },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBarComponent, useValue: MatSnackBarMock },
        UserOwnSignUpService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    })
      .overrideModule(BrowserModule, {set: {entryComponents: [SubmitEmailComponent]}})
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Basic tests', () => {
    beforeEach(() => {
      // @ts-ignore
      spyOn(component.pageName, 'emit');
    });

    it('should create SignUpComponent', () => {
      expect(component).toBeTruthy();
    });

    it('should call closeSignUpWindow ', () => {
      // @ts-ignore
      const spy = spyOn(component.matDialogRef, 'close').and.callThrough();
      // @ts-ignore
      component.closeSignUpWindow();
      expect(spy).toHaveBeenCalled();
    });

    it('should call openSignUpPopup', () => {
      // @ts-ignore
      spyOn(component.dialog, 'open');
      // @ts-ignore
      component.openSignUpPopup();
      // @ts-ignore
      expect(component.dialog).toBeDefined();
    });

    it('should emit "sign-in" after calling openSignInWindow', () => {
      component.openSignInWindow();
      // @ts-ignore
      expect(component.pageName.emit).toHaveBeenCalledWith('sign-in');
    });
  });

  describe('Reset error messages', () => {
    it('Should reset error messages', () => {
      component.firstNameErrorMessageBackEnd = 'I am error message';
      component.emailErrorMessageBackEnd = 'I am error message';
      component.passwordErrorMessageBackEnd = 'I am error message';
      component.passwordConfirmErrorMessageBackEnd = 'I am error message';
      // @ts-ignore
      component.setNullAllMessage();
      expect(component.firstNameErrorMessageBackEnd).toBeNull();
      expect(component.passwordErrorMessageBackEnd).toBeNull();
      expect(component.emailErrorMessageBackEnd).toBeNull();
      expect(component.passwordConfirmErrorMessageBackEnd).toBeNull();
    });
  });

  describe('Password hiding testing:', () => {
    let debug: DebugElement;
    let hiddenEyeImg: HTMLImageElement;
    let hiddenEyeInput: HTMLInputElement;
    let hiddenEyeDeImg;
    let hiddenEyeDeInput;

    beforeEach(() => {
      debug = fixture.debugElement;
      hiddenEyeDeImg = debug.query(By.css('.show-password-img'));
      hiddenEyeDeInput = debug.query(By.css('.password-input'));
      hiddenEyeImg = hiddenEyeDeImg.nativeElement;
      hiddenEyeInput = hiddenEyeDeInput.nativeElement;
    });

    it('should display hiddenEye img', () => {
      fixture.detectChanges();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.hiddenEye);
    });

    it('should call setPasswordVisibility method', () => {
      spyOn(component, 'setPasswordVisibility');
      hiddenEyeImg.click();
      expect(component.setPasswordVisibility).toHaveBeenCalled();
    });

    it('should change img after calling setPasswordVisibility method', () => {
      hiddenEyeImg.click();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.openEye);

      hiddenEyeImg.click();
      expect(hiddenEyeImg.src).toContain(component.signUpImages.hiddenEye);
    });

    it('should change type of input after calling setPasswordVisibility method', () => {
      hiddenEyeImg.click();
      expect(hiddenEyeInput.type).toEqual('text');

      hiddenEyeImg.click();
      expect(hiddenEyeInput.type).toEqual('password');
    });
  });

  describe('Testing controls for the signUpForm:', () => {
    const controlsName = ['email', 'firstName', 'password', 'repeatPassword'];
    const invalidName = ['.Jhon', 'Nick&', 'Mi$ke', '@Andrian'];
    const validName = ['JhonSmith', 'Nick12', 'Angela', 'Andrian'];
    const invalidPassword = ['12345aS', '12345aaS', '123456S@', '123456a@'];
    const validPassword = ['12345aS@', 'Aqwert1%', 'Pi$98765', '!1234567kT'];

    function testWrapper(itemValue) {
      it(`should create form with formControl: ${itemValue};`, () => {
        expect(component.signUpForm.contains(itemValue)).toBeTruthy();
      });
    }

    controlsName.forEach(el => testWrapper(el));

    it('form should be invalid when empty', () => {
      expect(component.signUpForm.valid).toBeFalsy();
    });

    function controlsValidator(itemValue, controlName, status) {
      it(`The formControl: ${controlName} should be marked as ${status} if the value is ${itemValue}.`, () => {
        const control = component.signUpForm.get(controlName);
        control.setValue(itemValue);
        status === 'valid'
          ? expect(control.valid).toBeTruthy()
          : expect(control.valid).toBeFalsy();
      });
    }

    invalidName.forEach(el => controlsValidator(el, 'firstName', 'invalid'));

    validName.forEach(el => controlsValidator(el, 'firstName', 'valid'));

    invalidPassword.forEach(el => controlsValidator(el, 'password', 'invalid'));

    validPassword.forEach(el => controlsValidator(el, 'password', 'valid'));

    it('form should be invalid passwords not matching', () => {
      const passwordControl = component.signUpForm.get('password');
      passwordControl.setValue('123456qQ@');
      const repeatPasswordControl = component.signUpForm.get('repeatPassword');
      repeatPasswordControl.setValue('23456qQ@1');
      expect(component.signUpForm.valid).toBeFalsy();
    });

  });

  describe('Check sign up methods', () => {
    let userOwnSecurityService: UserOwnSignUpService;
    let mockUserSuccessSignIn: UserSuccessSignIn;
    let mockFormData;

    beforeEach(() => {
      userOwnSecurityService = fixture.debugElement.injector.get(UserOwnSignUpService);
      mockFormData = {
        email: 'test@gmail.com',
        firstName: 'JohnSmith',
        password: '123456qW@'
      };

      mockUserSuccessSignIn = {
        userId: '23',
        name: 'JohnSmith',
        accessToken: 'test',
        refreshToken: 'test',
      };
    });

    it('onSubmit should call UserOwnSecurityService', () => {
      // @ts-ignore
      component.onSubmitSuccess = () => true;
      const spy = spyOn(userOwnSecurityService, 'signUp').and.returnValue(Observable.of(mockFormData));
      component.onSubmit(mockFormData);
      expect(spy).toHaveBeenCalledWith(mockFormData, null);
    });

    it('onSubmit should call onSubmitError', () => {
      const errors = new HttpErrorResponse({ error: [{ name: 'name', message: 'Ups' }] });
      const spy = spyOn(userOwnSecurityService, 'signUp').and.returnValue(throwError(errors));
      component.onSubmit(mockFormData);
      // @ts-ignore
      expect(spy).toHaveBeenCalled();
    });

    it('loadingAnim should equele true', () => {
      component.onSubmit(mockFormData);
      expect(component.loadingAnim).toEqual(true);
    });

    describe('Check sign up with signInWithGoogle', () => {
      it('Should call sinIn method', async(inject([AuthService, GoogleSignInService],
        (service: AuthService, service2: GoogleSignInService) => {
        const serviceSpy = spyOn(service, 'signIn').and.returnValue(promiseSocialUser).and.callThrough();
        spyOn(service2, 'signIn').and.returnValue(of(mockUserSuccessSignIn));
        component.signUpWithGoogle();
        fixture.detectChanges();
        expect(serviceSpy).toHaveBeenCalled();
      })));

      it('Should call sinIn method with errors', async(inject([AuthService, GoogleSignInService],
        (service: AuthService, service2: GoogleSignInService) => {
        const promiseErrors = new Promise<SocialUser>((resolve, reject) => {
          const errors = new HttpErrorResponse({ error: [{ name: 'email', message: 'Ups' }] });
          reject(errors);
        });
        const serviceSpy = spyOn(service, 'signIn').and.returnValue(promiseErrors);
        component.signUpWithGoogle();
        fixture.detectChanges();
        expect(serviceSpy).toHaveBeenCalled();
      })));

      it('signUpWithGoogleSuccess should navigate to profilePage', fakeAsync(() => {
        // @ts-ignore
        component.signUpWithGoogleSuccess(mockUserSuccessSignIn);
        fixture.ngZone.run(() => {
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile', mockUserSuccessSignIn.userId]);
        });
        fixture.destroy();
        flush();
      }));

      it('onSubmitSuccess should call openSignUpPopup', fakeAsync(() => {
        const mockSuccessSignUp = {
          email: 'test@gmail.com',
          ownRegistrations: true,
          userId: '23',
          username: 'UserName'
        };
        // @ts-ignore
        spyOn(component, 'openSignUpPopup');
        // @ts-ignore
        component.onSubmitSuccess(mockSuccessSignUp);
        fixture.detectChanges();
        fixture.ngZone.run(() => {
          fixture.whenStable().then(() => {
            // @ts-ignore
            expect(component.openSignUpPopup).toHaveBeenCalled();
          });
        });
        fixture.destroy();
        flush();
      }));
    });
  });

  describe('Check ErrorMessageBackEnd', () => {

    it('should return firstNameErrorMessageBackEnd when login failed', () => {
      const errors = new HttpErrorResponse({ error: [
        { name: 'name', message: 'Ups' },
        { name: 'email', message: 'Ups' },
        { name: 'password', message: 'Ups' },
        { name: 'passwordConfirm', message: 'Ups' }
      ] });
      // @ts-ignore
      component.onSubmitError(errors);
      fixture.detectChanges();
      expect(component.firstNameErrorMessageBackEnd).toBe('Ups');
      expect(component.emailErrorMessageBackEnd).toBe('Ups');
      expect(component.passwordErrorMessageBackEnd).toBe('Ups');
      expect(component.passwordConfirmErrorMessageBackEnd).toBe('Ups');
    });

    it('should return emailErrorMessageBackEnd when login failed', () => {
      const errors = new HttpErrorResponse({ error: [{ name: 'email', message: 'Ups' }] });
      // @ts-ignore
      component.signUpWithGoogleError(errors);
      fixture.detectChanges();
      expect(component.emailErrorMessageBackEnd).toBe('Ups');
    });

    it('should return passwordConfirmErrorMessageBackEnd when login failed', () => {
      const errors = new HttpErrorResponse({ error: [{ name: 'password', message: 'Ups' }] });
      // @ts-ignore
      component.signUpWithGoogleError(errors);
      fixture.detectChanges();
      expect(component.passwordConfirmErrorMessageBackEnd).toBe('Ups');
    });

    it('should reset emailErrorMessageBackEnd', () => {
      component.setEmailBackendErr();
      expect(component.emailErrorMessageBackEnd).toBeNull();
    });

    it('signUpWithGoogleError should set errors', () => {
      // @ts-ignore
      const result = component.signUpWithGoogleError('User cancelled login or did not fully authorize');
      expect(result).toBe();
    });

    it('signUpWithGoogleError should set errors', () => {
      const errors = { error: {
        message: 'Ups'
      }};
      // @ts-ignore
      component.signUpWithGoogleError(errors);
      expect(component.backEndError).toBe('Ups');
    });
  });
});
