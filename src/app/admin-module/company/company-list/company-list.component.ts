import { Component } from '@angular/core';
import { Company } from '../../../types';

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [],
  templateUrl: './company-list.component.html',
  styleUrl: './company-list.component.css'
})
export class CompanyListComponent {

companyList: Company[] = [
  {
    "id": 1,
    "title": "Your Company",
    "address": "",
    "type": "Company",
    "country": "United States",
    "timezone": "Europe/London",
    "parent": null
  },
  {
    "id": 2,
    "title": "Head Office",
    "address": "PO Box 001002\nSample Road, Sample Town",
    "type": "Head Office",
    "country": "United States",
    "timezone": "Europe/London",
    "parent": "Your Company"
  },
  {
    "id": 3,
    "title": "Marketing Department",
    "address": "PO Box 001002\nSample Road, Sample Town",
    "type": "Department",
    "country": "United States",
    "timezone": "Europe/London",
    "parent": "Head Office"
  },
  {
    "id": 4,
    "title": "Development Center",
    "address": "PO Box 001002\nSample Road, Sample Town",
    "type": "Regional Office",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Your Company"
  },
  {
    "id": 5,
    "title": "Engineering Department",
    "address": "PO Box 001002\nSample Road, Sample Town,  341234",
    "type": "Department",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Development Center"
  },
  {
    "id": 6,
    "title": "Development Team",
    "address": "",
    "type": "Unit",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Engineering Department"
  },
  {
    "id": 7,
    "title": "QA Team",
    "address": "",
    "type": "Unit",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Engineering Department"
  },
  {
    "id": 8,
    "title": "Server Administration",
    "address": "",
    "type": "Unit",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Engineering Department"
  },
  {
    "id": 9,
    "title": "Administration & HR",
    "address": "",
    "type": "Department",
    "country": "Singapore",
    "timezone": "Europe/London",
    "parent": "Development Center"
  }
];

}
