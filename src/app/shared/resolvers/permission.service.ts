import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalStorageManagerService } from '../Services/local-storage-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService implements Resolve<{
  permission: string;
  isAssign: boolean;
}[]> {

  constructor(
    private _localStorage: LocalStorageManagerService,
    private router: Router
  ) { }

  resolve(route: ActivatedRouteSnapshot ): Observable<{
    permission: string;
    isAssign: boolean;
  }[]> {
    const routePermissions = route.data['permission']?.split(',') || [];

    const employeeDetails = this._localStorage.getEmployeeDetail();
    if (!employeeDetails || employeeDetails.length === 0) {
      // Redirect to dashboard if no employee details exist
      this.router.navigate(['/dashboard']);
      return of([]);
    }

    const permissions = employeeDetails[0]?.rolePermission?.systemModulePermissions?.systemModules || [];

    // Map each route permission to its assignment status
    const resolvedPermissions = routePermissions.map(routePermission => {
      const isAssigned = permissions.some(module =>
        module.modulePermissions.some(permission => permission.title === routePermission && permission.isAssigned)
      );
      return { permission: routePermission, isAssign: isAssigned };
    });

    // Check if any "View" permission is not assigned
    const hasUnassignedViewPermission = resolvedPermissions.some(
      p => p.permission.includes('View') && !p.isAssign
    );

    if (hasUnassignedViewPermission) {
      // Navigate to dashboard for unassigned "View" permissions
      this.router.navigate(['/dashboard']);
      return of([]); // Return empty to handle resolver gracefully
    }

    return of(resolvedPermissions).pipe(
      // Ensure navigation is triggered synchronously if required
      tap(() => {
        if (hasUnassignedViewPermission) {
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }
}
