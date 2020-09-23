import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared/shared.service';
import {TranslateService } from '@ngx-translate/core';
import {AuthService } from '../auth.service';
import { distinctUntilKeyChanged, tap } from 'rxjs/operators';


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

    this.activatedRoute.params.subscribe((params) => {
      console.log(params, params.userId);
      if (params && params.userId) {
        this.authService.confirmCodeVerification(params.userId, params.code).subscribe(_ => {
          this.router.navigate(['myaccount']);
        });
      } else {
        this.createForm();
      }
    });


  }

  createForm(): void{

    this.registrationForm = new FormGroup({
      username: new FormControl('',  Validators.required),
      email: new FormControl('', Validators.compose([Validators.email, Validators.required])),
      password: new FormControl('', Validators.required)
    });

    this.registrationForm.valueChanges.subscribe(_ => {
      if (this.registrationForm.invalid) {
        this.translateService.get('registration.form.err_message').subscribe(res => {
          this.sharedService.errorModal(res);
        });
      }
    });
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.authService.registration(this.registrationForm.value).subscribe(data => {
      console.log('registration', data);

    });
  }

}
