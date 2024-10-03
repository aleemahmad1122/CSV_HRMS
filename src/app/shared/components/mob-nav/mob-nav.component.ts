import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mob-nav',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './mob-nav.component.html',
  styleUrl: './mob-nav.component.css'
})
export class MobNavComponent {

}
