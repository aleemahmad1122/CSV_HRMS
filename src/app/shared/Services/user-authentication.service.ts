import { Injectable } from '@angular/core';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { Router } from '@angular/router';
import { ApiCallingService } from './api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {
  constructor(
    private _router: Router,
    private _localStorageManagerService: LocalStorageManagerService,
    private _toaster: ToastrService,
    private api: ApiCallingService
  ) { }

  saveUser(data: any): void {
    this._localStorageManagerService.saveUserToStorage(data);
  }

  saveAdminUser(): void {
    this._localStorageManagerService.saveAdminUserToStorage();
  }

  saveUserRole(role: number): void {
    this._localStorageManagerService.saveUserRole(role);
  }

  getUserRole(): number {
    return this._localStorageManagerService.getUserRole();
  }

  updateUser(data: any): void {
    this._localStorageManagerService.updateUserToStorage(data);
  }

  setToken(token: string): void {
    this._localStorageManagerService.setTokenToStorage(token);
  }

  getToken(): string {
    return this._localStorageManagerService.getTokenFromStorage();
  }

  setRefreshToken(refreshToken: string): void {
    this._localStorageManagerService.setRefreshTokenToStorage(refreshToken);
  }

  getRefreshToken(): string {
    return this._localStorageManagerService.getRefreshTokenToStorage();
  }

  isLogin(): boolean {
    return this._localStorageManagerService.isLoginValidationFromStorage();
  }

  isAdmin(): boolean {
    return this._localStorageManagerService.isAdminValidationFromStorage();
  }

  getUser(): any {
    return this._localStorageManagerService.getUserFromStorage();
  }

  getUserId(): number {
    return this._localStorageManagerService.getUserIdFromStorage();
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.api.postData('Auth', 'refreshToken', { refreshToken }, true);
  }


  logout(): void {
    const refreshToken = this._localStorageManagerService.getRefreshTokenToStorage();

    this.api.postData("Auth", "logout", {refreshToken}, true, this._localStorageManagerService.getEmployeeDetail()[0].employeeId)
      .subscribe({
        next: (response) => {
          if (response?.status === 200) {
            this._localStorageManagerService.clearLocalStorage();
            this._router.navigateByUrl('/login');
            // this._toaster.success(response.message)
            // window.location.reload()
          }
        },
        error: (error) => {
          this._toaster.error(error.message || error || 'Something Went Wrong !');
          this._localStorageManagerService.clearLocalStorage();
          this._router.navigateByUrl('/login');
        }
      });
  }
}
