import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class ApiCallingService {
  constructor(
    private _httpClient: HttpClient, 
    private _toaster: ToastrService,
    private _loader: NgxSpinnerService) {
  }

  getData<T>(controllerName: string, methodName: string, showLoader: boolean): Observable<any> {
    if(showLoader) {
      this._loader.show();
    }
    return this._httpClient.get<any>(`${environment.baseUrl}${controllerName}/${methodName}`).pipe(this.catchApiErrors());
  }

  postData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean): Observable<any> {
    if(showLoader) {
      this._loader.show();
    }
    return this._httpClient.post<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body).pipe(this.catchApiErrors());
  }

  fileUpload<T>(controllerName: string, methodName: string, body: any, showLoader: boolean): Observable<any> {
    if(showLoader) {
      this._loader.show();
    }
    return this._httpClient.post<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body, { reportProgress: true, observe: 'events' }).pipe(this.catchApiErrors());
  }

  putData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean): Observable<any> {
    if(showLoader) {
      this._loader.show();
    }
    return this._httpClient.put<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body).pipe(this.catchApiErrors());
  }

  deleteData<T>(controllerName: string, methodName: string,body: any, showLoader: boolean): Observable<any> {
    if(showLoader) {
      this._loader.show();
    }
    
    const options = {
      body: body
    };

    return this._httpClient.delete<any>(`${environment.baseUrl}${controllerName}/${methodName}`, options).pipe(this.catchApiErrors())
  }

  catchApiErrors(): OperatorFunction<any, any> {
    return catchError(error => {
      this._loader.hide();
      return throwError(() => 
      this._toaster.error("Internal server error occured while processing your request")
    )})
  }
}
