import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserAuthenticationService } from '../Services/user-authentication.service';

@Injectable({
  providedIn: 'root'
})
class PublicGuardService {

  constructor(private _router: Router, private _authService: UserAuthenticationService) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this._authService.isLogin()) {
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
