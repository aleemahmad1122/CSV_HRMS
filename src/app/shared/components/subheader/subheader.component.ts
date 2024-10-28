import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from '../../Services/breadcrumb.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-subheader',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subheader.component.html',
  styleUrls: ['./subheader.component.css'],
})
export class SubheaderComponent implements OnInit {
  breadcrumbs: Array<{ label: string, url: string }> = [];

  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit(): void {
    // Subscribe to the breadcrumbs observable to get updates
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
      console.log('Breadcrumbs updated:', this.breadcrumbs);
    });
  }
}
