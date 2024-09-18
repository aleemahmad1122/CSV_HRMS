import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-view-expense-sheet',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-expense-sheet.component.html',
  styleUrl: './view-expense-sheet.component.css'
})

export class ViewExpenseSheetComponent {
  private ngUnsubscribe = new Subject<void>();
  allExpenses: any = [];
  selectedObj: any;
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
  }

  ngOnInit(): void {
    this.getExpenses();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getExpenses(): void {
    this._apiCalling.getData("expense", `${this._authService.getUserId()}`, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allExpenses = response.data;
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  deleteConfirmation(expense: any): void {
    this.selectedObj = {};
    this.selectedObj.expenseId = expense.expenseId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteExpense(): void {
    this._apiCalling.deleteData("expense", "delete/" + this.selectedObj.expenseId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getExpenses();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, expense: any): void {
    if (type === 1) {
      this._router.navigate([`${'/expense/add-expense-sheet'}`]);
    } else if (type === 3) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('expense');
        localStorage.setItem('expense', JSON.stringify(expense));
      }
      this._router.navigateByUrl(`${`/expense/edit-expense-sheet?expenseId=0&isView=1`}`);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('expense');
        localStorage.setItem('expense', JSON.stringify(expense));
      }
      this._router.navigateByUrl(`${`/expense/edit-expense-sheet?expenseId=${expense.expenseId}`}`);
    }
  }

  downloadExcel(): void {
    if (this.allExpenses.length > 0) {
      var wb = XLSX.utils.book_new();
      var header = [];
      var Data = [];
      var Heading = [];
      header.push("Sr.#", "Batch #", "Total (Exluding VAT)", "Total (Including VAT)", "Status", "Created By", "Created Date");
      Heading.push(header);
      var SrNumber = 1;
      for (var k = 0; k < this.allExpenses.length; k++) {
        Data.push({
          "SrNumber": 'ES-' + this.padNumberWithZeros(SrNumber),
          "expenseId": this.allExpenses[k].expenseId,
          "totalBeforeVat": this.allExpenses[k].totalBeforeVat,
          "totalWithVat": this.allExpenses[k].totalWithVat,
          "status": this.allExpenses[k].status === 1 ? "Pending" : this.allExpenses[k].status === 2 ? "Accepted" : this.allExpenses[k].status === 3 ? "Rejected" : "",
          "createdBy": this.allExpenses[k].createdBy,
          "createdDate": new Date(this.allExpenses[k].createdDate).toLocaleDateString()
        });

        SrNumber += 1;
      }
      var ws = XLSX.utils.aoa_to_sheet(Heading);
      ws["!cols"] = [
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 }
      ];
      XLSX.utils.sheet_add_json(ws, Data, {
        skipHeader: true,
        origin: -1,
      });
      XLSX.utils.book_append_sheet(wb, ws, "ExpenseSheet");
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'ExpenseSheet' + ".xlsx");
    }
  }

  downloadExpenseExcel(expenseItem: any): void {
    if (this.allExpenses.length > 0) {
      var wb = XLSX.utils.book_new();
      var header = [];
      var Data = [];
      var Heading = [];
      header.push("Sr.#", "Date", "Document Number", "Cost Center", "Description", "Total (Exluding VAT)", "VAT", "Total (Including VAT)", "Attachment Count", "Status");
      Heading.push(header);
      var SrNumber = 1;
      for (var k = 0; k < expenseItem.expenseSubInformation.length; k++) {
        Data.push({
          "SrNumber": SrNumber,
          "Date": new Date(expenseItem.expenseSubInformation[k].receiptDate).toLocaleDateString(),
          "DocumentNumber": expenseItem.expenseSubInformation[k].documentNumber,
          "CostCenter": expenseItem.expenseSubInformation[k].costCenter,
          "Description": expenseItem.expenseSubInformation[k].remarks,
          "Total (Exluding VAT)": expenseItem.expenseSubInformation[k].totalBeforeVat,
          "VAT": expenseItem.expenseSubInformation[k].vat,
          "totalWithVat": expenseItem.expenseSubInformation[k].totalWithVat,
          "attachmentCount": expenseItem.expenseSubInformation[k].expenseMediaInformation.length,
          "status": expenseItem.expenseSubInformation[k].status === 1 ? "Pending" : expenseItem.expenseSubInformation[k].status === 2 ? "Accepted" : expenseItem.expenseSubInformation[k].status === 3 ? "Rejected" : "",
        });

        SrNumber += 1;
      }
      var ws = XLSX.utils.aoa_to_sheet(Heading);
      ws["!cols"] = [
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 },
        { wpx: 140 }
      ];
      XLSX.utils.sheet_add_json(ws, Data, {
        skipHeader: true,
        origin: -1,
      });
      XLSX.utils.book_append_sheet(wb, ws, "ExpenseItemSheet");
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'ExpenseItemSheet' + ".xlsx");
    }
  }

  changeStatus(event: any, expenseId: number): void {
    this.remarksList = [];
    this.changeStatusObj = {};
    this.changeStatusObj.remarks = '';
    this.changeStatusObj.expenseId = expenseId;
    this.changeStatusObj.status = Number(event?.target?.value);
    this.changeStatusObj.actionBy = this._authService.getUserId();
    $("#remarksModal").modal('show');
  }

  saveRemarks(): void {
    this.changeStatusObj.remarks = this.changeStatusObj.remarks.trim();
    this._apiCalling.postData("expense", "saveRemarks", this.changeStatusObj, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#remarksModal").modal('hide');
            this.getExpenses();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  viewRemarksHistory(expense: any): void {
    this._apiCalling.getData("expense", `getRemarks/${expense.expenseId}`, true)
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
