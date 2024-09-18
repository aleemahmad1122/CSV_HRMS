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
  selector: 'app-view-suppliers',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-suppliers.component.html',
  styleUrl: './view-suppliers.component.css'
})
export class ViewSuppliersComponent {
  private ngUnsubscribe = new Subject<void>();
  allSuppliers: any = [];
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
    this.getSuppliers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSuppliers(): void {
    this._apiCalling.getData("supplier", "", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allSuppliers = response.data;
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  deleteConfirmation(user: any): void {
    this.selectedObj = {};
    this.selectedObj.supplierId = user.supplierId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteUser(): void {
    this._apiCalling.deleteData("supplier", "delete/" + this.selectedObj.supplierId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getSuppliers();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, supplier: any): void {
    if (type === 1) {
      this._router.navigate([`${'/configuration/add-supplier'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('tempSupplier');
        localStorage.setItem('tempSupplier', JSON.stringify(supplier));
      }

      this._router.navigateByUrl(`${`/configuration/edit-supplier?supplierId=${supplier.supplierId}`}`);
    }
  }

}
