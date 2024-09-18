import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-view-banks',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-banks.component.html',
  styleUrl: './view-banks.component.css'
})
export class ViewBanksComponent {
  private ngUnsubscribe = new Subject<void>();
  allBanks: any = [];
  selectedObj: any;
  query: any;

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    @Inject(PLATFORM_ID) private platformId: Object) {

  }
  ngOnInit(): void {
    this.getBank();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBank(): void {
    this._apiCalling.getData("bankReceipt", "getBanks", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allBanks = response.data;
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  deleteConfirmation(user: any): void {
    this.selectedObj = {};
    this.selectedObj.bankId = user.bankId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  delete(): void {
    this._apiCalling.deleteData("bankReceipt", "deleteBank/" + this.selectedObj.bankId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getBank();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, bank: any): void {
    if (type === 1) {
      this._router.navigate([`${'/configuration/add-bank'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('tempBank');
        localStorage.setItem('tempBank', JSON.stringify(bank));
      }
      this._router.navigateByUrl(`${`/configuration/edit-bank?bankId=${bank.bankId}`}`);
    }
  }
}
