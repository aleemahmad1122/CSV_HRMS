import { Component } from '@angular/core';
import { Projects } from '../../../types/index';
@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css'
})
export class ProjectListComponent {


  projectlist:Projects[] =  [
      {
        id: 1,
        name: "Project 1",
        client: null
      },
      {
        id: 2,
        name: "Project 2",
        client: null
      },
      {
        id: 3,
        name: "Project 3",
        client: "IceHrm Sample Client 1"
      },
      {
        id: 4,
        name: "Project 4",
        client: "IceHrm Sample Client 2"
      }
    ]

  }
