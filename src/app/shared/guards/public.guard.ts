import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserAuthenticationService } from '../Services/user-authentication.service';
import { DataShareService } from '../Services/data-share.service';

@Injectable({
  providedIn: 'root'
})
class PublicGuardService {
isLogin:boolean;
  constructor(
    private _router: Router,
    private _dataShare: DataShareService,
    private _authService: UserAuthenticationService
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

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.isLogin) {
      this._router.navigate(['dashboard']);
      return false;
    }
    else {
      return true;
    }
  }
}

export const PublicGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PublicGuardService).canActivate(next, state);
  // return false
}
