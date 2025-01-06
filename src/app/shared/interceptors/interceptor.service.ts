import { HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, catchError, throwError } from 'rxjs';
import { UserAuthenticationService } from '../Services/user-authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService {

  constructor(
    private _authService: UserAuthenticationService,
    private _toaster: ToastrService,
    private _loader: NgxSpinnerService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let req = null;
    if (this._authService.isLogin()) {
      const idToken = this._authService.getToken();
      req = request.clone({ headers: request.headers.set('Authorization', `Bearer ${idToken}`) });
    } else {
      req = request;
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this._loader.hide();
        }

        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } else {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        if (error.status === 403 || error.status  === 401) {
          this._toaster.info('Your session has expired')
          this._authService.logout();
          setTimeout(() => {
            window.location.reload();
          }, 200);
        }
        this._loader.hide();
        return throwError(() => error);
      })
    );
  }
}
