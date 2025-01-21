import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserAuthenticationService } from '../Services/user-authentication.service';
import { DataShareService } from '../Services/data-share.service';

@Injectable({
  providedIn: 'root'
})
class ProtectedGuardService {

  isLogin:boolean;

  constructor(
    private _router: Router,
    private _dataShare: DataShareService,
     private _authService: UserAuthenticationService
  )
  {
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
      return true;
    }
    else {
      this._router.navigateByUrl('/login');
      return false;
    }
  }
}

export const ProtectedGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(ProtectedGuardService).canActivate(next, state);
  // return true
}
