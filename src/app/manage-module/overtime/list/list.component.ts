import { Component } from '@angular/core';
import { Overtime } from '../../../types/index';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {

  overtimeList:Overtime[] = [
    {
      id: 1,
      code: "OT001",
      name: "Overtime 1"
    },
    {
      id: 2,
      code: "OT002",
      name: "Overtime 2"
    },
    {
      id: 3,
      code: "OT003",
      name: "Overtime 3"
    }
  ];


}
