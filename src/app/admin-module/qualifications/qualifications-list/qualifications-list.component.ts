import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { Qualification } from '../../../types';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-qualifications-list',
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule, TranslateModule],
  templateUrl: './qualifications-list.component.html',
  styleUrl: './qualifications-list.component.css'
})
export class QualificationsListComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
  ) { }

  qualificationsList: Qualification[] = [
    {
      id: 1,
      name: "Programming and Application Development",
      description: "Programming and Application Development"
    },
    {
      id: 2,
      name: "Project Management",
      description: "Project Management"
    },
    {
      id: 3,
      name: "Help Desk/Technical Support",
      description: "Help Desk/Technical Support"
    },
    {
      id: 4,
      name: "Networking",
      description: "Networking"
    },
    {
      id: 5,
      name: "Databases",
      description: "Databases"
    },
    {
      id: 6,
      name: "Business Intelligence",
      description: "Business Intelligence"
    },
    {
      id: 7,
      name: "Cloud Computing",
      description: "Cloud Computing"
    },
    {
      id: 8,
      name: "Information Security",
      description: "Information Security"
    },
    {
      id: 9,
      name: "HTML Skills",
      description: "HTML Skills"
    },
    {
      id: 10,
      name: "Graphic Designing",
      description: "Graphic Designing Work"
    }
  ];

  ngOnInit(): void { }



}
