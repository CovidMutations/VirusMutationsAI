import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { SharedService } from '../../shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  constructor(
    private readonly sharedService: SharedService,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,

  ) {
    const { userId, code } = this.activatedRoute.snapshot.params;
    if (userId) {
      this.authService.confirmCodeVerification(userId, code)
        .pipe(take(1))
        .subscribe(
          _ => {
            this.router.navigate(['auth']);
          },
          e => {
            const message = e.error && e.error.message
              || this.translateService.instant('registration.form.err_message');
            this.sharedService.errorModal(message);
          }
        );
    } else {
      this.createForm();
    }
  }

  createForm(): void{

    this.registrationForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      email: new FormControl('', Validators.compose([
        Validators.email,
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(50),
      ])),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ]),
      password2: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
      ])
    }, (form: FormGroup) => {
      if (form.get('password').value !== form.get('password2').value) {
        return { confirmPassword: true };
      }
      return null;
    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.authService.registration(this.registrationForm.value).subscribe(
      () => this.registrationForm = null,
      e => {
        const message = e.error && e.error.message || this.translateService.instant('registration.form.err_message');
        this.sharedService.errorModal(message);
      },
    );
  }

}
