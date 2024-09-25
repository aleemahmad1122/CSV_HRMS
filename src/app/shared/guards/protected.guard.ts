import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserAuthenticationService } from '../Services/user-authentication.service';

@Injectable({
  providedIn: 'root'
})
class ProtectedGuardService {

  constructor(private _router: Router, private _authService: UserAuthenticationService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._authService.isLogin()) {
      return true;
    }
    else {
      this._router.navigateByUrl('');
      return false;
    }
  }
}

export const ProtectedGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(ProtectedGuardService).canActivate(next, state);
  // return true
}
