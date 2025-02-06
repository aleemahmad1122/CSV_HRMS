import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageManagerService } from '../../Services/local-storage-manager.service';
import { EmployeeDetail } from '../../../types/index';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  emp: EmployeeDetail;

  fullYear = new Date().getFullYear();

  footerLink:{name:string;path:string;}[]


  constructor(
    private _localStrong: LocalStorageManagerService
  ) {
    this.emp = this._localStrong.getEmployeeDetail()?.[0] ?? {} as EmployeeDetail;

    this.footerLink = [
      {
        name: "language.generic.profile",
        path:"/employee/employee/employee/edit"
      },
      {
        name: "language.generic.dashboard",
        path:""
      },
      {
        name: "language.generic.attendance",
        path:"/attendance/attendance-list"
      },
    ]


  }


}
