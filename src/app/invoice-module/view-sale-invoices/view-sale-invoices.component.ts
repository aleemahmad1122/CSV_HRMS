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
  selector: 'app-view-sale-invoices',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-sale-invoices.component.html',
  styleUrl: './view-sale-invoices.component.css'
})
export class ViewSaleInvoicesComponent {
  private ngUnsubscribe = new Subject<void>();
  invoicesList: any = [];
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
    this.getSalesInvoices();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSalesInvoices(): void {
    this._apiCalling.getData("invoice", "sale/" + this._authService.getUserId(), true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.invoicesList = response.data;
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, invoice: any): void {
    if (type === 1) {
      this._router.navigate([`${'/invoice/add-sale-invoice'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('invoice');
        localStorage.setItem('invoice', JSON.stringify(invoice));
      }
      this._router.navigateByUrl(`${`/invoice/edit-sale-invoice?invoiceId=${invoice.invoiceId}`}`);
    }
  }

  deleteConfirmation(invoice: any): void {
    this.selectedObj = {};
    this.selectedObj.invoiceId = invoice.invoiceId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteLocations(): void {
    this._apiCalling.deleteData("invoice", "delete/" + this.selectedObj.invoiceId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getSalesInvoices();
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
    if (this.invoicesList.length > 0) {
      var wb = XLSX.utils.book_new();
      var header = [];
      var Data = [];
      var Heading = [];
      header.push("Sr.#", "Date", "Supplier Name", "Invoice Number", "Total (Exluding VAT)", "VAT", "Total (Including VAT)"
        , "Status", "Created By", "Created Date"
      );
      Heading.push(header);
      var SrNumber = 1;
      for (var k = 0; k < this.invoicesList.length; k++) {
        Data.push({
          "SrNumber": 'IVS-' + this.padNumberWithZeros(SrNumber),
          "receiptDate": new Date(this.invoicesList[k].receiptDate).toLocaleDateString(),
          "name": this.invoicesList[k].name,
          "invoiceNumber": this.invoicesList[k].invoiceNumber,
          "totalBeforeVat": this.invoicesList[k].totalBeforeVat,
          "vat": this.invoicesList[k].vat,
          "totalWithVat": this.invoicesList[k].totalWithVat,
          "status": this.invoicesList[k].status === 1 ? "Pending" : this.invoicesList[k].status === 2 ? "Accepted" : this.invoicesList[k].status === 3 ? "Rejected" : "",
          "createdBy": this.invoicesList[k].createdBy,
          "createdDate": new Date(this.invoicesList[k].createdDate).toLocaleDateString()
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
        { wpx: 100 },
      ];
      XLSX.utils.sheet_add_json(ws, Data, {
        skipHeader: true,
        origin: -1,
      });
      XLSX.utils.book_append_sheet(wb, ws, "SaleInvoice");
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'SaleInvoice' + ".xlsx");
    }
  }

  changeStatus(event: any, invoiceId: number): void {
    this.remarksList = [];
    this.changeStatusObj = {};
    this.changeStatusObj.remarks = '';
    this.changeStatusObj.invoiceId = invoiceId;
    this.changeStatusObj.status = Number(event?.target?.value);
    this.changeStatusObj.actionBy = this._authService.getUserId();
    $("#remarksModal").modal('show');
  }

  saveRemarks(): void {
    this.changeStatusObj.remarks = this.changeStatusObj.remarks.trim();
    this._apiCalling.postData("invoice", "saveRemarks", this.changeStatusObj, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#remarksModal").modal('hide');
            this.getSalesInvoices();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  viewRemarksHistory(invoice: any): void {
    this._apiCalling.getData("invoice", `getRemarks/${invoice.invoiceId}`, true)
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
