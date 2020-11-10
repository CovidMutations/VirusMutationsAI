import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;

  constructor(
    private readonly sharedService: SharedService,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) { }

  ngOnInit(): void {
    this.authForm = new FormGroup({
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
      ])
    });
  }

  onSubmit(): void {
    this.authService.login(this.authForm.value).subscribe(
      () => this.router.navigate(['myaccount']),
      e => {
        const message = e.error && e.error.message || this.translateService.instant('auth.form.err_message');
        this.sharedService.errorModal(message);
      },
    );
  }
}
