import { AfterViewInit, Component, EventEmitter, Inject, Injectable, OnInit, Output } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Sidebar } from "../../../types/index";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
declare const $: any;
@Injectable()
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, AfterViewInit {
  isCollapsed = false;
  activRoute: string = '';
  adminItems: Sidebar[] = [
    {
      name: 'language.sidebar.company',
      route: '/admin/company-structure'
    },
    {
      name: 'language.sidebar.jobDetailsSetup',
      route: '/admin/job-detail'
    },
    {
      name: 'language.sidebar.qualifications',
      route: '/admin/qualifications'
    },
    {
      name: 'language.sidebar.projects',
      route: '/admin/projects'
    },
    {
      name: 'language.sidebar.clients',
      route: '/admin/clients'
    },
    {
      name: 'language.sidebar.role',
      route: '/admin/role'
    },
    {
      name: 'language.sidebar.shift',
      route: '/admin/shift'
    },
    {
      name: 'language.sidebar.designation',
      route: '/admin/designation'
    },
    {
      name: 'language.sidebar.department',
      route: '/admin/department'
    },
    {
      name: 'language.sidebar.team',
      route: '/admin/team'
    },
    {
      name: 'language.sidebar.attachmentType',
      route: '/admin/attachmentType'
    },
  ]

  employeeItems: Sidebar[] = [
    {
      name: 'language.sidebar.employee',
      route: '/employee/employee-list'
    },
  ]

  attendanceItems: Sidebar[] = [
    {
      name: 'language.sidebar.attendance',
      route: '/attendance/employee'
    },
    {
      name: 'language.sidebar.leave',
      route: '/attendance/leave-employee'
    },
    {
      name: 'language.sidebar.leaveType',
      route: '/attendance/leave-type-list'
    },
    {
      name: 'language.sidebar.attendanceImport',
      route: '/attendance/import'
    },
  ]

  manageItems: Sidebar[] = [
    {
      name: 'language.sidebar.document',
      route: '/manage/document'
    },
    {
      name: 'language.sidebar.attendance',
      route: '/manage/attendance'
    },
    {
      name: 'language.sidebar.travel',
      route: '/manage/travel'
    },
    {
      name: 'language.sidebar.overtime',
      route: '/manage/overtime'
    },
    {
      name: 'language.sidebar.loans',
      route: '/manage/loans'
    },
  ]

  adminReportItems: Sidebar[] = [
    {
      name: 'language.sidebar.report',
      route: '/admin-report/report'
    },
  ]

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }


  constructor(
    @Inject(DOCUMENT)
    private _document: Document,
    private _route: Router,
    public translate: TranslateService
  ) {
    _route.events.subscribe((val) =>
      this.activRoute = _route.url
    )


  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {
    this.loadScript();
  }

  // New method to load the script
  loadScript() {
    const script = document.createElement('script');
    script.src = './assets/js/scripts.bundle.js';
    script.async = true;
    document.body.appendChild(script);
  }


}
