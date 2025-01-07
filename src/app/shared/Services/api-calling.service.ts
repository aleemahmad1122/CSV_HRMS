import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, OperatorFunction, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageManagerService } from "./local-storage-manager.service";
@Injectable({
  providedIn: 'root'
})
export class ApiCallingService {



  companyId: string | null = '';
  employeeId: string | null = '';


  constructor(
    private _httpClient: HttpClient,
    private _toaster: ToastrService,
    private _localStorage: LocalStorageManagerService,
    private _loader: NgxSpinnerService
  ) {

  }



  getData<T>(
    controllerName: string,
    methodName: string,
    showLoader: boolean,
    paginationParams?: {
      employeeId?: string;
      date?:string;
      attachmentType?:string | number;
      page?: number;
      limit?: number;
      searchQuery?: string;
      activeStatus?: string | number;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }


    const staticQueryParams = {
      companyId: this._localStorage.getCompanyDetail().companyId,
      activeStatus: paginationParams?.activeStatus ?? 1,
      ...paginationParams
    };
    return this._httpClient.get<any>(`${environment.baseUrl}${controllerName}/${methodName}`, { params: staticQueryParams }).pipe(this.catchApiErrors());
  }

  postData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean, employeeId?: string): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }
    const staticQueryParams = { companyId: this._localStorage.getCompanyDetail().companyId, employeeId: employeeId   };
    return this._httpClient.post<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body, { params: staticQueryParams }).pipe(this.catchApiErrors());
  }

  fileUpload<T>(controllerName: string, methodName: string, body: any, showLoader: boolean): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }
    const staticQueryParams = { companyId: this._localStorage.getCompanyDetail().companyId, employeeId: this.employeeId };
    return this._httpClient.post<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body, { reportProgress: true, observe: 'events', params: staticQueryParams }).pipe(this.catchApiErrors());
  }

  putData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean, employeeId?: string): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }
    const staticQueryParams = { companyId: this._localStorage.getCompanyDetail().companyId, employeeId: employeeId };
    return this._httpClient.put<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body, { params: staticQueryParams }).pipe(this.catchApiErrors());
  }

  patchData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean, employeeId?: string): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }
    const staticQueryParams = { companyId: this._localStorage.getCompanyDetail().companyId, employeeId: employeeId };
    return this._httpClient.patch<any>(`${environment.baseUrl}${controllerName}/${methodName}`, body, { params: staticQueryParams }).pipe(this.catchApiErrors());
  }

  deleteData<T>(controllerName: string, methodName: string, body: any, showLoader: boolean, employeeId?: string): Observable<any> {
    if (showLoader) {
      this._loader.show();
    }

    const options = {
      body: body,
      params: { companyId: this._localStorage.getCompanyDetail().companyId, employeeId: employeeId }
    };

    return this._httpClient.delete<any>(`${environment.baseUrl}${controllerName}/${methodName}`, options).pipe(this.catchApiErrors());
  }

  catchApiErrors(): OperatorFunction<any, any> {
    return catchError(error => {
      this._loader.hide();
      const errorMessage = error.error?.message || "Internal server error occurred while processing your request";
      // this._toaster.error(errorMessage);
      return throwError(() => error);
    });
  }
}
