import { Sidebar } from "../../../types/index";
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AfterViewInit, Component, OnInit, Inject } from '@angular/core';
import { LocalStorageManagerService } from '../../Services/local-storage-manager.service';
import { ApiCallingService } from "../../Services/api-calling.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit {

  missingAttendanceReq: number = 0;
  remoteAttendanceReq: number = 0;
  totalAttendanceReq: number = 0;
  totalLeavesReq: number = 0;

  isCollapsed = false;
  activRoute: string = '';

  adminItems: Sidebar[] = [
    {
      name: 'language.sidebar.company',
      route: '/admin/company-structure',
      permissions: 'View_Company',
      show: false,
    },
    {
      name: 'language.sidebar.jobDetailsSetup',
      route: '/admin/job-detail',
      permissions: 'View_Job',
      show: false,
    },
    {
      name: 'language.sidebar.qualifications',
      route: '/admin/qualifications',
      permissions: 'View_Qualification',
      show: false,
    },
    {
      name: 'language.sidebar.projects',
      route: '/admin/projects',
      permissions: 'View_Project',
      show: false,
    },
    {
      name: 'language.sidebar.clients',
      route: '/admin/clients',
      permissions: 'View_Client',
      show: false,
    },
    {
      name: 'language.sidebar.role',
      route: '/admin/role',
      permissions: 'View_Role',
      show: false,
    },
    {
      name: 'language.sidebar.shift',
      route: '/admin/shift',
      permissions: 'View_Shift',
      show: false,
    },
    {
      name: 'language.sidebar.designation',
      route: '/admin/designation',
      permissions: 'View_Designation',
      show: false,
    },
    {
      name: 'language.sidebar.department',
      route: '/admin/department',
      permissions: 'View_Department',
      show: false,
    },
    {
      name: 'language.sidebar.team',
      route: '/admin/team',
      permissions: 'View_Team',
      show: false,
    },
    {
      name: 'language.sidebar.attachmentType',
      route: '/admin/attachmentType',
      permissions: 'View_Attachment_Type',
      show: false,
    },
    {
      name: 'language.sidebar.leaveType',
      route: '/admin/leave-type-list',
      permissions: 'View_Leave_Type',
      show: false,
    },
    {
      name: 'language.sidebar.assetsType',
      route: '/admin/assets-type',
      permissions: 'View_Asset_Type',
      show: false,
    },
    {
      name: 'language.sidebar.assets',
      route: '/admin/assets',
      permissions: 'View_Asset',
      show: false,
    },
  ];

  employeeItems: Sidebar[] = [
    {
      name: 'language.sidebar.manageEmployee',
      route: '/employee/employee-list',
      permissions: 'View_Employee',
      show: false,
    },
    {
      name: 'language.sidebar.importEmployee',
      route: '/employee/import',
      permissions: 'Import_Employees',
      show: false,
    },
  ];

  attendanceItems: Sidebar[] = [
    {
      name: 'language.sidebar.manageAttendance',
      route: '/attendance/attendance-list',
      permissions: 'View_Attendance',
      show: false,
    },
    {
      name: 'language.sidebar.attendanceRequest',
      route: '/attendance/request',
      permissions: 'View_Missing_Attendance',
      show: false,
    },
    {
      name: 'language.sidebar.remoteWorkRequest',
      route: '/attendance/remote',
      permissions: 'View_Remote_Attendance',
      show: false,
    },
    {
      name: 'language.sidebar.attendanceImport',
      route: '/attendance/import',
      permissions: 'Import_Attendance',
      show: false,
    },
  ];

  leaveItems: Sidebar[] = [
    {
      name: 'language.sidebar.manageLeave',
      route: '/leave/leave-list',
      permissions: 'View_Leave',
      show: false,
    },
    {
      name: 'language.sidebar.leaveRequest',
      route: '/leave/request',
      permissions: 'View_Leave_Requests',
      show: false,
    },
  ];
  payrollItems: Sidebar[] = [

    {
      name: 'language.sidebar.salaryComponent',
      route: '/payroll/salary-component',
      permissions: 'View_Salary_Component',
      show: false,
    },
    {
      name: 'language.sidebar.salaryFrequency',
      route: '/payroll/salary-frequency',
      permissions: 'View_Salary_Frequency',
      show: false,
    },
    {
      name: 'language.sidebar.payGroup',
      route: '/payroll/group',
      permissions: 'View_Paygroup',
      show: false,
    },
  ];
  loanItems: Sidebar[] = [

    {
      name: 'language.sidebar.manageLoan',
      route: '/loan/list',
      permissions: 'View_Salary_Component',
      show: false,
    },

    {
      name: 'language.sidebar.requestLoan',
      route: '/loan/request',
      permissions: 'View_Salary_Component',
      show: false,
    },
  ];

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _router: Router,
    private apiService: ApiCallingService,
    private _localStorage: LocalStorageManagerService,
    public translate: TranslateService
  ) {
    this.getNotificationsCount()
  }

  ngOnInit(): void {
    this.loadScript();
    this.initializeActiveRoute();
    this.initializePermissions();
  }

  ngAfterViewInit(): void { }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private getNotificationsCount(): void {

    // Call the API with the active status filter
    this.apiService.getData('Dashboard', 'getNotificationsCount', true, { employeeId: this._localStorage.getEmployeeDetail()[0].employeeId })
      .subscribe({
        next: (res: {
          message: string;
          status: number;
          success: boolean;
          data: {
            missingAttendanceReq: number;
            remoteAttendanceReq: number;
            totalAttendanceReq: number;
            totalLeavesReq: number;
          }
        }) => {

          this.missingAttendanceReq = res.data.missingAttendanceReq;
          this.remoteAttendanceReq = res.data.remoteAttendanceReq;
          this.totalAttendanceReq = res.data.totalAttendanceReq;
          this.totalLeavesReq = res.data.totalLeavesReq;
        },
        error: () => '',
      });
  }



  private loadScript(): void {
    const script = this._document.createElement('script');
    script.src = './assets/js/scripts.bundle.js';
    script.async = true;
    this._document.body.appendChild(script);
  }

  private initializeActiveRoute(): void {
    this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activRoute = event.url;
      }
    });
  }


  private initializePermissions(): void {
    const employeeDetails = this._localStorage.getEmployeeDetail();
    if (!employeeDetails || employeeDetails.length === 0) {
      return;
    }

    const permissions = employeeDetails[0]?.rolePermission?.systemModulePermissions?.systemModules || [];

    [this.adminItems, this.employeeItems, this.attendanceItems, this.leaveItems, this.payrollItems, this.loanItems].forEach(itemList => {
      itemList.forEach(item => {
        const requiredPermissions = item.permissions?.split(',') || [];
        const hasPermission = requiredPermissions.some(routePermission =>
          permissions.some(module =>
            module.modulePermissions.some(permission => permission.title === routePermission && permission.isAssigned)
          )
        );
        item.show = hasPermission || requiredPermissions.length === 0;
      });

      const hasVisibleItems = itemList.some(item => item.show);
      if (!hasVisibleItems) {
        itemList.length = 0;
      }
    });
  }

}

