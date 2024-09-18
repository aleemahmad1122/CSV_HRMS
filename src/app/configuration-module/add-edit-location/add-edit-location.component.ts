import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { UserAuthenticationService } from '../../shared/Services/user-authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-edit-location',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit-location.component.html',
  styleUrl: './add-edit-location.component.css'
})
export class AddEditLocationComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  locationForm!: FormGroup;
  isEdit: boolean = false;
  selectedLocation: any;
  constructor(
    private _router: Router,
    private _toaster: ToastrService,
    private _fb: FormBuilder,
    private _apiCalling: ApiCallingService,
    private _authService: UserAuthenticationService,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.route.queryParams.subscribe(params => {
      this.isEdit = false;
      this.selectedLocation = {};
      if (params['locationId'] !== undefined && params['locationId'] !== null && params['locationId'] !== '' && params['locationId'] !== 0) {
        this.isEdit = true;
        if (isPlatformBrowser(this.platformId)) {
          this.selectedLocation = JSON.parse(localStorage.getItem('loc')!);
        }

      }
    });

    this.locationForm = this._fb.group({
      region: ['', [Validators.required]],
      city: ['', [Validators.required]],
      area: ['', [Validators.required]],
      address: ['']
    });

    this.prefilledForm();
  }

  prefilledForm(): void {
    if (!this.isEdit)
      return;

    this.locationForm.patchValue({
      region: this.selectedLocation.region,
      city: this.selectedLocation.city,
      area: this.selectedLocation.area,
      address: this.selectedLocation.address,
    })
  }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('loc');
    }

  }

  submitForm(): void {
    if (!this.locationForm.valid) {
      return;
    }

    if (!this.isEdit) {
      this._apiCalling.postData("location", "add",
        {
          "region": this.locationForm.get('region')?.value,
          "city": this.locationForm.get('city')?.value,
          "area": this.locationForm.get('area')?.value,
          "address": this.locationForm.get('address')?.value,
          "actionBy": this._authService.getUserId()
        }, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToLocations();

            } else {
              this._toaster.error(response?.message, 'Error!');
            }
          },
          error: (error) => {
            this._toaster.error("Internal server error occured while processing your request")
          }
        })
    } else {
      this._apiCalling.putData("location", "edit/" + this.selectedLocation.locationId + "",
        {
          "region": this.locationForm.get('region')?.value,
          "city": this.locationForm.get('city')?.value,
          "area": this.locationForm.get('area')?.value,
          "address": this.locationForm.get('address')?.value,
          "actionBy": this._authService.getUserId()
        }, true)
        .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
          next: (response) => {
            if (response?.success) {
              this._toaster.success(response?.message, 'Success!');
              this.backToLocations();

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

  backToLocations(): void {
    this._router.navigate([`${'/configuration/locations'}`]);
  }

}
