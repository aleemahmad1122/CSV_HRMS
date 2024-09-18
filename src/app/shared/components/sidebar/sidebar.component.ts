import { AfterViewInit, Component, Inject, Injectable, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
