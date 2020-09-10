import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SharedService } from '../../shared/shared.service';
import {TranslateService } from '@ngx-translate/core';
import {AuthService } from '../auth.service';

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
    private readonly authService: AuthService

  ) { }

  ngOnInit(): void {

    this.authForm = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.email, Validators.required])),
      password: new FormControl('', Validators.required)
    });

    this.authForm.valueChanges.subscribe(_ => {
      if (this.authForm.invalid) {
        this.translateService.get('auth.form.err_message').subscribe(res => {
          this.sharedService.errorModal(res);
        });
      }
    });

  }


  onSubmit(): void {
    this.authService.login(this.authForm.value).subscribe();
  }
}
