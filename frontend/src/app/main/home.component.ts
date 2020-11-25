import { Component } from '@angular/core';
import { AuthQuery } from '../auth/store/auth.query';

@Component({
  templateUrl: './home.component.html',
  styleUrls: []
})
export class HomeComponent {
  constructor(
    public readonly authQuery: AuthQuery,
  ) { }
}
