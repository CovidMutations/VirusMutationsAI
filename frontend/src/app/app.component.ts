import { Component } from '@angular/core';
import { SharedService } from './shared/shared.service';
import { AuthQuery } from './auth/store/auth.query';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isMenuShow = false;
  isLoading = false;

  constructor(
    private readonly sharedService: SharedService,
    public readonly authQuery: AuthQuery,
    private readonly authService: AuthService,
  ) {

    this.sharedService.preloaderSbj.subscribe(val => {
      this.isLoading = val;
    });
  }

  public onLogoutClick(): void {
    this.authService.logout();
  }
}
