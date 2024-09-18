import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-view-customers',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-customers.component.html',
  styleUrl: './view-customers.component.css'
})
export class ViewCustomersComponent {
  private ngUnsubscribe = new Subject<void>();
  allCustomers: any = [];
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
    this.getCustomers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCustomers(): void {
    this._apiCalling.getData("customer", "", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allCustomers = response.data;
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  deleteConfirmation(user: any): void {
    this.selectedObj = {};
    this.selectedObj.customerId = user.customerId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteUser(): void {
    this._apiCalling.deleteData("customer", "delete/" + this.selectedObj.customerId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getCustomers();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, customer: any): void {
    if (type === 1) {
      this._router.navigate([`${'/configuration/add-customer'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('tempCustomer');
        localStorage.setItem('tempCustomer', JSON.stringify(customer));
      }
      this._router.navigateByUrl(`${`/configuration/edit-customer?customerId=${customer.customerId}`}`);
    }
  }

}
