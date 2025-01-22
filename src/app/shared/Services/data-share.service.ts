import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ICheckInSummary } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  checkInTimeSubject = new BehaviorSubject<ICheckInSummary | null>(this.getCheckInTime());
  $shareSupplierId: Subject<number> = new Subject<number>();
  $shareCustomerId: Subject<number> = new Subject<number>();
  $shareBankId: Subject<number> = new Subject<number>();
  $updateLoginStatus: Subject<boolean> = new Subject<boolean>();
  constructor() { }



  getCheckInTimeObservable() {
    return this.checkInTimeSubject.asObservable();
  }

  getCheckInTime(): ICheckInSummary | null {
    // Your logic to fetch the check-in time from local storage
    const checkInTime = localStorage.getItem('checkInTime');
    return checkInTime ? JSON.parse(checkInTime) : null;
  }

  updateCheckInTime(newTime: ICheckInSummary): void {
    localStorage.setItem('checkInTime', JSON.stringify(newTime));
    this.checkInTimeSubject.next(newTime);
  }

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
