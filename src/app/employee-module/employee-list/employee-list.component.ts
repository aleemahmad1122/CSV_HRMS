import { Component } from '@angular/core';
import { Employee } from '../../types/index'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.css'
})
export class EmployeeListComponent {


employeeList:Employee[] = [
  {
    "id": 1,
    "code": "SE",
    "name": "Software Engineer"
  },
  {
    "id": 2,
    "code": "ASE",
    "name": "Assistant Software Engineer"
  },
  {
    "id": 3,
    "code": "PM",
    "name": "Project Manager"
  },
  {
    "id": 4,
    "code": "QAE",
    "name": "QA Engineer"
  },
  {
    "id": 5,
    "code": "PRM",
    "name": "Product Manager"
  },
  {
    "id": 6,
    "code": "AQAE",
    "name": "Assistant QA Engineer "
  },
  {
    "id": 7,
    "code": "TPM",
    "name": "Technical Project Manager"
  },
  {
    "id": 8,
    "code": "PRS",
    "name": "Pre-Sales Executive"
  },
  {
    "id": 9,
    "code": "ME",
    "name": "Marketing Executive"
  },
  {
    "id": 10,
    "code": "DH",
    "name": "Department Head"
  }
]


}
