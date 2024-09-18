import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Router } from '@angular/router';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare const $: any;
@Component({
  selector: 'app-view-locations',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-locations.component.html',
  styleUrl: './view-locations.component.css'
})
export class ViewLocationsComponent {
  
  private ngUnsubscribe = new Subject<void>();
  allLocations: any = [];
  selectedObj: any = {};
  query: any;
  constructor (
    private _router: Router,
    private _toaster: ToastrService,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object) {
      
  }
  ngOnInit(): void {
    this.getLocations();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getLocations(): void {
    this._apiCalling.getData("location","", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if(response?.success) {
            this.allLocations = response.data;  
          }
        },
        error: (error) => {
         this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, loc: any): void {
    if (type === 1) {
      this._router.navigate([`${'/configuration/add-location'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('loc');
        localStorage.setItem('loc', JSON.stringify(loc));
      }
      
      this._router.navigateByUrl(`${`/configuration/edit-location?locationId=${loc.locationId}`}`);
    }
  }

  deleteConfirmation(loc: any): void {
    this.selectedObj = {};
    this.selectedObj.locationId = loc.locationId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteLocations(): void {
    this._apiCalling.deleteData("location","delete/"+this.selectedObj.locationId+"",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if(response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getLocations();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
         this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  // downloadExcel(): void {
  //   if (this.allLocations.length > 0) {
  //     var wb = XLSX.utils.book_new();
  //     var header = [];
  //     var Data = [];
  //     var Heading = [];
  //     header.push("Sr.#", "Title", "Address", "Phone", "Created By", "Status");
  //     Heading.push(header);
  //     var SrNumber = 1;
  //     for (var k = 0; k < this.allLocations.length; k++) {
  //       Data.push({
  //         "SrNumber": SrNumber,
  //         "title": this.allLocations[k].title,
  //         "address": this.allLocations[k].address,
  //         "phone": this.allLocations[k].phone,
  //         "createdBy": this.allLocations[k].firstName+ '' +this.allLocations[k].lastName,
  //         "status": this.allLocations[k].isActive? 'Active':'In-Active',
  //       });
  
  //       SrNumber += 1;
  //     }
  //     var ws = XLSX.utils.aoa_to_sheet(Heading);
  //     ws["!cols"] = [
  //       { wpx: 60 },
  //       { wpx: 60 },
  //       { wpx: 60 },
  //       { wpx: 60 },
  //       { wpx: 60 },
  //       { wpx: 60 },
  //     ];
  //     XLSX.utils.sheet_add_json(ws, Data, {
  //       skipHeader: true,
  //       origin: -1,
  //     });
  //     XLSX.utils.book_append_sheet(wb, ws, "Locations");
  //     var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  //     FileSaver.saveAs(new Blob([wbout], { type: "application/octet-stream" }), 'Locations' + ".xlsx");
  //   }
  // }
}
