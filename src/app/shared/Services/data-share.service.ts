import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  $shareSupplierId: Subject<number> = new Subject<number>();
  $shareCustomerId: Subject<number> = new Subject<number>();
  $shareBankId: Subject<number> = new Subject<number>();
  $updateLoginStatus: Subject<boolean> = new Subject<boolean>();
  constructor() { }
  
  shareSupplierId(supplierId:number): void {
    this.$shareSupplierId.next(supplierId);
  }

  shareCustomerId(customerId:number): void {
    this.$shareCustomerId.next(customerId);
  }

  shareBankId(bankId:number): void {
    this.$shareBankId.next(bankId);
  }

  updateLoginStatus(isLogin:boolean): void {
    this.$updateLoginStatus.next(isLogin);
  }

}
