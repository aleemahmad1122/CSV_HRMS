import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Clients } from '../../../types';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
  ) { }

  clientList: Clients[] =  [
    {
      id: 1,
      name: "IceHrm Sample Client 1",
      details: null,
      address: "001, Sample Road,\nSample City, USA",
      contact_number: "678-894-1047"
    },
    {
      id: 2,
      name: "IceHrm Sample Client 2",
      details: null,
      address: "001, Sample Road,\nSample City, USA",
      contact_number: "678-894-1047"
    }
  ] ;

  ngOnInit(): void { }


}
