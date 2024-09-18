import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageManagerService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  saveUserToStorage(data:any): boolean {
    this.removeUser();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user',JSON.stringify(data));  
    }
    
    return true;
  }


  savePermissionsToStorage(data:any): boolean {
    this.removePermissions();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('permissions',JSON.stringify(data));
    }
    return true;
  }

  getPermissionsFromStorage(): any {
    return JSON.parse(localStorage.getItem('permissions')!);
  }

  saveAdminUserToStorage(): void {
    this.removeAdmin();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('isAdmin','1');
    }
  }

  updateUserToStorage(data:any): void {
    this.removeUser();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user',JSON.stringify(data));
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
      role =  Number(localStorage.getItem('role'));
    }
    return role;
  }

  getTokenFromStorage(): string{
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token =  localStorage.getItem('token') || '{}';
    }
    return token;
    
  }

  setTokenToStorage(token:string): void {
    this.removeToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token',token);
    }
  }

  isLoginValidationFromStorage(): boolean {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    } 

    return token !== '' ?  true : false;
  }

  isAdminValidationFromStorage(): boolean {
    let token = false;
    if (isPlatformBrowser(this.platformId)) {
      let token = localStorage.getItem('isAdmin') || '';
      token === '1' ?  true : false;
    } 
    return token;
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
}
