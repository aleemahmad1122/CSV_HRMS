import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CompanyDetail, EmployeeDetail, ICheckInSummary } from "../../types/index";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageManagerService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  saveUserToStorage(data: any): boolean {
    this.removeUser();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(data));
    }

    return true;
  }


  savePermissionsToStorage(data: any): boolean {
    this.removePermissions();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('permissions', JSON.stringify(data));
    }
    return true;
  }

  getPermissionsFromStorage(): any {
    return JSON.parse(localStorage.getItem('permissions')!);
  }

  saveAdminUserToStorage(): void {
    this.removeAdmin();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isAdmin', '1');
    }
  }

  updateUserToStorage(data: any): void {
    this.removeUser();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(data));
    }

  }

  saveUserRole(role: number): void {
    this.removeRole();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('role', role.toString());
    }
  }

  getUserRole(): number {
    let role = 0;
    if (isPlatformBrowser(this.platformId)) {
      role = Number(localStorage.getItem('role'));
    }
    return role;
  }

  getTokenFromStorage(): string {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '{}';
    }
    return token;

  }

  setCompanyDetail(companyDetail: CompanyDetail): void {
    this.removeCompanyDetail();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('companyDetail', JSON.stringify(companyDetail));
    }
  }

  getCompanyDetail(): CompanyDetail {
    let companyDetail: CompanyDetail;
    if (isPlatformBrowser(this.platformId)) {
      companyDetail = JSON.parse(localStorage.getItem('companyDetail')) || {};
    }
    return companyDetail;

  }


  removeCompanyDetail(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('companyDetail');
    }
  }






  setEmployeeDetail(employeeDetail: EmployeeDetail[]): void {
    this.removeEmployeeDetail();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('employeeDetail', JSON.stringify(employeeDetail));
    }
  }

  getEmployeeDetail(): EmployeeDetail[] {
    let employeeDetail: EmployeeDetail[] = [];
    if (isPlatformBrowser(this.platformId)) {
      employeeDetail = JSON.parse(localStorage.getItem('employeeDetail')) || [];
    }
    return employeeDetail;

  }


  removeEmployeeDetail(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('employeeDetail');
    }
  }






  setTokenToStorage(token: string): void {
    this.removeToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  isLoginValidationFromStorage(): boolean {
    let emp = '';
    if (isPlatformBrowser(this.platformId)) {
      emp = localStorage.getItem('employeeDetail') || '';
    }

    return emp.length > 0 ? true : false;
  }

  isAdminValidationFromStorage(): boolean {
    let isAdmin = false; // Changed variable name for clarity
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('isAdmin') || ''; // Removed redundant declaration
      isAdmin = token === '1'; // Corrected the assignment logic
    }
    return isAdmin; // Return the correct boolean value
  }

  getUserFromStorage(): any {
    let user = {};
    if (isPlatformBrowser(this.platformId)) {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    return user;
  }

  getUserIdFromStorage(): number {
    let userId = 0;
    if (isPlatformBrowser(this.platformId)) {
      userId = JSON.parse(localStorage.getItem('user') || '{}').userId;
    }

    return userId;
  }

  getUserRoleFromStorage(): string {
    let userRole = '';
    if (isPlatformBrowser(this.platformId)) {
      userRole = JSON.parse(localStorage.getItem('user') || '{}').role;
    }
    return userRole;
  }

  clearLocalStorage(): any {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }

  }

  removePermissions(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('permissions');
    }
  }

  removeUser(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
  }

  removeAdmin(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('isAdmin');
    }
  }

  removeRole(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('role');
    }
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  removeOtpEmail(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('otpEmail');
    }
  }

  getCheckInTime(): ICheckInSummary | null {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('checkInTime');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  saveCheckInTime(checkInTime: ICheckInSummary): void {
    this.removeCheckInTime();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('checkInTime', JSON.stringify(checkInTime));
    }
  }

  removeCheckInTime(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('checkInTime');
    }
  }

}
