import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy, NgZone, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
import { IGetSystemPermissions, IResGetSystemPermissions } from "../../../types/index";
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-role-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FormsModule],
  templateUrl: './role-add-edit.component.html',
  styleUrl: './role-add-edit.component.css'
})
export class RoleAddEditComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedAddEditValue: any;

  systemModules: IGetSystemPermissions[] = []


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addEditForm = this.createForm();
  }



  ngOnInit(): void {



    this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
      const id = params['id'];
      if(!id){
        this.getSystemPermissions()
      }
      this.isEditMode = id;

      if (this.isEditMode && isPlatformBrowser(this.platformId)) {

        this.apiCalling.getData("Role", `getRoleById/${id}`, true)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
            next: (response) => {
              if (response?.success) {
                this.selectedAddEditValue = response?.data;
                this.systemModules = response?.data?.systemModulePermissions.systemModules
                this.patchFormValues();
                this.changeDetectorRef.detectChanges();
                this.initializeTooltips();
              } else {
                this.selectedAddEditValue = [];
              }
            },
            error: (error) => {
              this.selectedAddEditValue = [];
            }
          });
        // this.patchFormValues(); // Removed this line
      }
    });
  }



  private getSystemPermissions(): void {
    this.apiCalling.getData("Role", `getSystemPermissions`, true)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
        next: (response: IResGetSystemPermissions) => {
          if (response.success) {


            this.systemModules = response.data.systemModules
            this.changeDetectorRef.detectChanges();
            this.initializeTooltips();
          } else {
            this.systemModules = []
          }
        },
        error: (error) => {
          this.toaster.error(error || 'An error occurred', 'Error!');
          this.systemModules = []
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      textColor: ["#ffffff"],
      backgroundColor: ['#000'],
      rolePermissions: []
    });
  }

  private patchFormValues(): void {
    if (this.selectedAddEditValue) {
      this.addEditForm.patchValue({
        name: this.selectedAddEditValue.name,
        textColor: this.selectedAddEditValue.textColor,
        backgroundColor: this.selectedAddEditValue.backgroundColor,
        rolePermissions: this.selectedAddEditValue.rolePermissions,
      });
    }
  }


  selectPermission(object: any, event: any): void {
    object.isAssigned = event.target.checked
  }



  submitForm(): void {

    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const body = {
      ...this.addEditForm.value,
      systemModules:this.systemModules
    };

    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Role", `updateRole/${this.isEditMode}`, body, true)
      : this.apiCalling.postData("Role", "addRole", body, true);

    apiCall.pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (response) => {
        if (response?.success) {
          this.toaster.success(response.message, 'Success!');
          this.goBack();
        } else {
          this.toaster.error(response?.message || 'An error occurred', 'Error!');
        }
      },
      error: (error) => {
        console.error('API error:', error);

      }
    });
  }

  goBack(): void {
    this.router.navigate([window.history.back()]);
  }
  private initializeTooltips(): void {
    this.ngZone.runOutsideAngular(() => {
      // Dispose existing tooltips
      const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltips.forEach((element) => {
        const tooltip = bootstrap.Tooltip.getInstance(element);
        if (tooltip) {
          tooltip.dispose();
        }
      });

      // Initialize new tooltips with configuration
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: 'hover',
          placement: 'top',
          container: 'body'
        });
      });
    });}

}
