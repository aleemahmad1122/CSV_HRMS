import * as Components from "./shared/components/index";
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserAuthenticationService } from './shared/Services/user-authentication.service';
import { jwtDecode } from "jwt-decode";
import { DataShareService } from './shared/Services/data-share.service';
import { ApiCallingService } from "./shared/Services/api-calling.service";
import { LocalStorageManagerService } from "./shared/Services/local-storage-manager.service";
import { EmployeeDetail } from "./types";



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
    Components.TopbarComponent,
    Components.QuickPanelComponent,
    Components.QuickCartComponent,
    Components.UserPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'CSV_HRMS-Client';
  isLogin: boolean;
  isOnline: boolean = true;
  emp: EmployeeDetail;


  constructor(
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _localStorageService: LocalStorageManagerService,
    private _apiCalling: ApiCallingService
  ) {
    this.isLogin = _authService.isLogin();
    this._dataShare.$updateLoginStatus.subscribe(isLogin => {

      if (isLogin) {
        this.isLogin = true;

      } else {
        this.isLogin = false;
      }
    });

  }


  ngOnInit() {
    this.emp = this._localStorageService.getEmployeeDetail()[0];
    this.checkConnectionStatus();
    setTimeout(() => {
    this.decodeToken(this._authService.getToken())
  }, 500);

  }

  @HostListener('window:online', ['$event'])
  @HostListener('window:offline', ['$event'])
  checkConnectionStatus() {
    this.isOnline = navigator.onLine;
  }

  retry(): void {
    window.location.reload()
  }

  decodeToken(token: string): void {

    try {
      const decoded: any = jwtDecode(token);
      const expirationTime = decoded.exp;
      const currentTime = Math.floor(Date.now() / 1000);

      if (expirationTime > currentTime) {
        this._apiCalling.postData("Auth", "refreshToken", {
          token: this._localStorageService.getTokenFromStorage(),
          refreshToken: this._localStorageService.getRefreshTokenToStorage()
        }, true,this.emp?.employeeId)
          .subscribe({
            next: (response) => {
              this.emp.rolePermission = response.data.rolePermission;

              this._localStorageService.setEmployeeDetail([this.emp] || []);
              this._authService.setToken(response.data?.token);
              this._authService.setRefreshToken(response.data?.refreshToken);
            },
            error: (error) => {
            this._authService.logout()
            }
          });
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }


}
