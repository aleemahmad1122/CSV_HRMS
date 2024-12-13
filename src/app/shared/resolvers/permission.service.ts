import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LocalStorageManagerService } from '../Services/local-storage-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService implements Resolve<boolean> {

  constructor(
    private _localStorage: LocalStorageManagerService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const routePermissions = route.data['permission']?.split(',') || [];

    const employeeDetails = this._localStorage.getEmployeeDetail();
    if (!employeeDetails || employeeDetails.length === 0) {
      this.router.navigate(['/dashboard']);
      return of(false);
    }

    const permissions = employeeDetails[0]?.rolePermission?.systemModulePermissions?.systemModules || [];

    const hasPermission = routePermissions.some(routePermission =>
      permissions.some(module =>
        module.modulePermissions.some(permission => permission.title === routePermission && permission.isAssigned)
      )
    );

    if (!hasPermission) {
      this.router.navigate(['/dashboard']);
    }

    return of(hasPermission);
  }
}
