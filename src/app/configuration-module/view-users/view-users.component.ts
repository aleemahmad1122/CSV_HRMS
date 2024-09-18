import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../../shared/pipes/filter.pipe';
import { HighlightPipe } from '../../shared/pipes/highlight.pipe';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
declare const $: any;

@Component({
  selector: 'app-view-users',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.css'
})
export class ViewUsersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  allUsers: any = [];
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
    this.getUsers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUsers(): void {
    this._apiCalling.getData("user", "", true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this.allUsers = response.data;
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  deleteConfirmation(user: any): void {
    this.selectedObj = {};
    this.selectedObj.userId = user.userId;
    this.selectedObj.actionBy = this._authService.getUserId();
    $("#deleteConfirmationModal").modal('show');
  }

  deleteUser(): void {
    this._apiCalling.deleteData("user", "delete/" + this.selectedObj.userId + "",
      {
        "actionBy": this.selectedObj.actionBy
      }, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response) => {
          if (response?.success) {
            this._toaster.success(response?.message, 'Success!');
            $("#deleteConfirmationModal").modal('hide');
            this.getUsers();
          } else {
            this._toaster.error(response?.message, 'Error!');
          }
        },
        error: (error) => {
          this._toaster.error("Internal server error occured while processing your request")
        }
      })
  }

  navigate(type: number, user: any): void {
    if (type === 1) {
      this._router.navigate([`${'/configuration/add-user'}`]);
    } else {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('tempUser');
        localStorage.setItem('tempUser', JSON.stringify(user));
      }

      this._router.navigateByUrl(`${`/configuration/edit-user?userId=${user.userId}`}`);
    }
  }

}
