import { Component } from '@angular/core';
import { Loan } from '../../../types/index';
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

  loanList:Loan[] = [
    {
      id: 1,
      code: "LOAN001",
      name: "Loan 1"
    },
    {
      id: 2,
      code: "LOAN002",
      name: "Loan 2"
    },
    {
      id: 3,
      code: "LOAN003",
      name: "Loan 3"
    }
  ];


}
