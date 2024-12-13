import { Injectable } from '@angular/core';
import { LocalStorageManagerService } from '../Services/local-storage-manager.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(
    private _localStorage: LocalStorageManagerService
  ) { }

  checkPermission(permissionTitle: string): boolean {
    const employeeDetails = this._localStorage.getEmployeeDetail();

    if (!employeeDetails || employeeDetails.length === 0) {
      return false;
    }

    const permissions = employeeDetails[0]?.rolePermission?.systemModulePermissions?.systemModules || [];

    const hasPermission = permissions.some(module =>
      module.modulePermissions.some(permission => permission.title === permissionTitle && permission.isAssigned)
    );

    return hasPermission;
  }
}
