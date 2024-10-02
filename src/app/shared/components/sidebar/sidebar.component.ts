import { AfterViewInit, Component, Inject, Injectable, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {Sidebar} from "../../../types/index";
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
  activRoute: string = '';
  adminItems: Sidebar[] = [
    {
      name: 'sidebar.company',
      route: '/admin/company-structure'
    },
    {
      name: 'sidebar.jobDetailsSetup',
      route: '/admin/job-detail'
    },
    {
      name: 'sidebar.qualifications',
      route: '/admin/qualifications'
    },
    {
      name: 'sidebar.projects',
      route: '/admin/projects'
    },
    {
      name: 'sidebar.clients',
      route: '/admin/clients'
    },
  ]

employeeItems: Sidebar[] = [
  {
    name: 'sidebar.employee',
    route: '/employee/employee-list'
  },
]

  constructor(@Inject(DOCUMENT) private _document: Document, private _route: Router, public translate: TranslateService) {
    _route.events.subscribe((val) =>
      this.activRoute = _route.url
    )


  }

  ngAfterViewInit(): void {

  }

  ngOnInit(): void {

  }


}
