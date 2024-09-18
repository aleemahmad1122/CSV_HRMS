import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, Input, PLATFORM_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { DataShareService } from '../../shared/Services/data-share.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-bank',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-bank.component.html',
  styleUrl: './add-edit-bank.component.css'
})
export class AddEditBankComponent {
  @Input('isChild') isChild: boolean = false;
  private ngUnsubscribe = new Subject<void>();
  bankForm!: FormGroup;
  isEdit: boolean = false;
  selectedBank: any;
  locations: any[] = [];
  attachedFiles: any[] = [];
  selectedFile: any;

  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private _route: ActivatedRoute,
    private _dataShare: DataShareService,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this._route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.selectedBank = {};
      if (params['bankId'] !== undefined && params['bankId'] !== null && params['bankId'] !== '' && params['bankId'] !== 0) {
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedBank = JSON.parse(localStorage.getItem('tempBank')!);
        }

      }
    });

    this.bankForm = this._fb.group(
      {
        title: ['', [Validators.required]],
        iban: ['', [Validators.required]]
      }
    );

  }

  prefilledForm(): void {
    if (!this.isEdit)
      return;

    this.bankForm.patchValue({
      title: this.selectedBank.title,
      iban: this.selectedBank.iban
    })
  }

  ngOnInit(): void {
    this.prefilledForm();
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('tempBank');
    }

  }

  submitForm(): void {
    if (!this.bankForm.valid) {
      return;
    }

    if (!this.isEdit) {
      this._apiCalling.postData("bankReceipt", "addBank", {
        title: this.bankForm.get('title')?.value,
        iban: this.bankForm.get('iban')?.value,
        actionBy: this._authService.getUserId(),
      }, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              if (!this.isChild) {
                this.back();
              } else {
                this._dataShare.shareBankId(response?.data?.bankId);
              }
            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    } else {
      this._apiCalling.putData("bankReceipt", "editBank/" + this.selectedBank.bankId + "",
        {
          title: this.bankForm.get('title')?.value,
          iban: this.bankForm.get('iban')?.value,
          actionBy: this._authService.getUserId(),
        }, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.back();

            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    }

  }

  back(): void {
    this._router.navigate([`${'/configuration/banks'}`]);
  }


}
