import * as Components from "./shared/components/index";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserAuthenticationService } from './shared/Services/user-authentication.service';

import { DataShareService } from './shared/Services/data-share.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxSpinnerModule,
    Components.ChatModalComponent,
    Components.DemoPanelComponent,
    Components.FooterComponent,
    Components.HeaderComponent,
    Components.MobNavComponent,
    Components.PageNotFoundComponent,
    Components.ScrolltopComponent,
    Components.SidebarComponent,
    Components.StickyToolbarComponent,
    Components.TopbarComponent,
    Components.SubheaderComponent,
    Components.QuickPanelComponent,
    Components.QuickCartComponent,
    Components.UserPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CSV_HRMS-Client';
  isLogin: boolean;
  constructor(private _authService: UserAuthenticationService,
    private _dataShare: DataShareService
  ) {
    this.isLogin = _authService.isLogin();
    this._dataShare.$updateLoginStatus.subscribe(isLogin => {
      console.warn(isLogin);

      if (isLogin) {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
    });

  }

}
