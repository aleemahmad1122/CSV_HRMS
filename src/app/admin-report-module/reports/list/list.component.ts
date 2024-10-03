import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminReportModule } from "../../../types/index"
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

adminReportItems: AdminReportModule[] = [
  {
    id: 1,
    code: "1",
    name: "Report 1"
  },
  {
    id: 2,
    code: "2",
    name: "Report 2"
  }
]


}
