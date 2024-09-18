import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-view-bank-purchase-receipt',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-bank-purchase-receipt.component.html',
  styleUrl: './view-bank-purchase-receipt.component.css'
})

export class ViewBankPurchaseReceiptComponent {
  private ngUnsubscribe = new Subject<void>();
  allBankReceipts: any = [];
  selectedObj: any = {};
  query: any;
  isUserRole: boolean = true;
  changeStatusObj: any = {};
  remarksList: any[] = [];
  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.isUserRole = _authService.getUserRole() === 3 ? true : false;
    this.changeStatusObj = {};
    this.changeStatusObj.remarks = '';
    this.changeStatusObj.receiptId = 0;
    this.changeStatusObj.actionBy = 0;
  }
  ngOnInit(): void {
    this.getBankReceipts();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBankReceipts(): void {
    $("#remarksModal").modal('hide');
    this.allBankReceipts = [];
    this._apiCalling.getData("bankReceipt", `getPurchseReceipt/${this._authService.getUserId()}`, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allBankReceipts = response.data;
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
      this._router.navigate([`${'/bank/add-purchase-receipt'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('bank');
        localStorage.setItem('bank', JSON.stringify(bank));
      }

      this._router.navigateByUrl(`${`/bank/edit-purchase-receipt?receiptId=${bank.receiptId}`}`);
    }
  }

  deleteConfirmation(receipt: any): void {
    this.selectedObj = {};

    this.selectedObj.receiptId = receipt.receiptId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteLocations(): void {
    this._apiCalling.deleteData("bankReceipt", "delete/" + this.selectedObj.receiptId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getBankReceipts();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  downloadExcel(): void {
    if (this.allBankReceipts.length > 0) {
      var wb = XLSX.utils.book_new();
      var header = [];
      var Data = [];
      var Heading = [];
      header.push("Sr.#", "Serial #", "Date", "Supplier", "Bank Name", "Amount", "Created Date", "Created By", "Status");
      Heading.push(header);
      var SrNumber = 1;
      for (var k = 0; k < this.allBankReceipts.length; k++) {
        Data.push({
          "SrNumber": 'BRP-' + this.padNumberWithZeros(SrNumber),
          "receiptNumber": this.allBankReceipts[k].receiptNumber,
          "receiptDate": new Date(this.allBankReceipts[k].receiptDate).toLocaleDateString(),
          "name": this.allBankReceipts[k].name,
          "bankName": this.allBankReceipts[k].bankName,
          "amount": this.allBankReceipts[k].amount,
          "createdDate": new Date(this.allBankReceipts[k].createdDate).toLocaleDateString(),
          "createdBy": this.allBankReceipts[k].createdBy,
          "status": this.allBankReceipts[k].status === 1 ? "Pending" : this.allBankReceipts[k].status === 2 ? "Accepted" : this.allBankReceipts[k].status === 3 ? "Rejected" : "",
        });

        SrNumber += 1;
      }
      var ws = XLSX.utils.aoa_to_sheet(Heading);
      ws["!cols"] = [
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
        { wpx: 100 },
      ];
      XLSX.utils.sheet_add_json(ws, Data, {
        skipHeader: true,
        origin: -1,
      });
      XLSX.utils.book_append_sheet(wb, ws, "PurchaseBankReceipt");
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'PurchaseBankReceipt' + ".xlsx");
    }
  }

  changeStatus(event: any, receiptId: number): void {
    this.remarksList = [];
    this.changeStatusObj = {};
    this.changeStatusObj.remarks = '';
    this.changeStatusObj.receiptId = receiptId;
    this.changeStatusObj.status = Number(event?.target?.value);
    this.changeStatusObj.actionBy = this._authService.getUserId();
    $("#remarksModal").modal('show');
  }

  saveRemarks(): void {
    this.changeStatusObj.remarks = this.changeStatusObj.remarks.trim();
    this._apiCalling.postData("bankReceipt", "saveReceiptRemarks", this.changeStatusObj, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#remarksModal").modal('hide');
            this.getBankReceipts();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  viewRemarksHistory(bank: any): void {
    this._apiCalling.getData("bankReceipt", `getRemarks/${bank.receiptId}`, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.remarksList = response.data;
            if (this.remarksList.length > 0) {
              $("#remarksModal").modal('show');
            } else {
              this._toaster.error('No Remarks Added', 'Error!');
            }

          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  padNumberWithZeros(num: number): string {
    return num.toString().padStart(4, '0');
  }
}
