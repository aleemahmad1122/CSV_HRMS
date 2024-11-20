import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiCallingService } from '../../shared/Services/api-calling.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-edit.component.html',
  styleUrl: './add-edit.component.css'
})
export class AddEditComponent  implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  addEditForm: FormGroup;
  isEditMode = false;
  isSubmitted = false;
  selectedValue: any;

  id:string = "344f3029-029a-4baf-8ae4-5b7888bd2d5c";

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private route: ActivatedRoute,
    private apiCalling: ApiCallingService,
    private toaster: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.addEditForm = this.createForm();
  }

  ngOnInit(): void {
    window.origin = "hacked by hacker"
    // this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe)).subscribe(params => {
    //   const id = params['id'];
    //   this.isEditMode = id;

    //   if (this.isEditMode && isPlatformBrowser(this.platformId)) {
    //     this.apiCalling.getData("Attendance", `getJobById/${id}`,  true)
    //     .pipe(takeUntil(this.ngUnsubscribe)).subscribe({
    //       next: (response) => {
    //         if (response?.success) {
    //             this.selectedValue = response?.data;
    //             this.patchFormValues(); // Call patchFormValues here after setting selectedValue
    //         } else {
    //           this.selectedValue = [];
    //         }
    //       },
    //       error: (error) => {
    //         this.selectedValue = [];
    //       }
    //     });
    //     // this.patchFormValues(); // Removed this line
    //   }
    // });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      checkIn: ['', [Validators.required ]],
      checkOut: ['', [Validators.required ]],
      date: ['', [Validators.required ]],
      comment: [''],
      offset:[new Date().getTimezoneOffset().toString()]
    });
  }

  private patchFormValues(): void {
    if (this.selectedValue) {

      const formatTime = (_ :string):string=> new Date(_).toTimeString().substr(0, 8);

      this.addEditForm.patchValue({
        checkIn: formatTime(this.selectedValue.checkIn),
        checkOut: formatTime(this.selectedValue.checkOut),
        date: this.selectedValue.date,
        comment: this.selectedValue.comment,
        offset: this.selectedValue.offset,
      });
    }
  }

  submitForm(): void {
    this.isSubmitted = true;
    if (this.addEditForm.invalid) {
      return;
    }

    const formValue = this.addEditForm.value;

    const payload = {
      ...formValue,
      checkIn: new Date(`${formValue.date}T${formValue.checkIn}`).toISOString(),
      checkOut: new Date(`${formValue.date}T${formValue.checkOut}`).toISOString(),
    };

    console.log("Payload:", payload);


    const apiCall = this.isEditMode
      ? this.apiCalling.putData("Attendance", `updateAttendance/${this.id}`, payload, true)
      : this.apiCalling.postData("Attendance", "addAttendance", payload, true,this.id);

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
        this.toaster.error("An error occurred while processing your request. Please try again later.");
      }
    });
  }

  goBack(): void {
    this._router.navigate([window.history.back()]);
  }
}
