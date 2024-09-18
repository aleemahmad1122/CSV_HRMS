import { Injectable } from '@angular/core';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserAuthenticationService {
  constructor(private _router:Router, private _localStorageManagerService: LocalStorageManagerService) {}

  saveUser(data:any): void {
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

  updateUser(data:any): void {
    this._localStorageManagerService.updateUserToStorage(data);
  }

  setToken(token: string): void {
    this._localStorageManagerService.setTokenToStorage(token);
  }

  getToken(): string {
    return this._localStorageManagerService.getTokenFromStorage();
  }

  isLogin(): boolean {
      return this._localStorageManagerService.isLoginValidationFromStorage();
  }
  
  isAdmin(): boolean {
    return this._localStorageManagerService.isAdminValidationFromStorage();
  }

  getUser(): any {
    return this._localStorageManagerService.getUserFromStorage();;
  }

  getUserId(): number {
      return this._localStorageManagerService.getUserIdFromStorage();
  }

  logout(): void {
    this._localStorageManagerService.clearLocalStorage();
    this._router.navigateByUrl('/');
  }
}
