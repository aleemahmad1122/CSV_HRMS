import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  activRoute: string = '';
  constructor(
    private _route: Router,
  ) {
    _route.events.subscribe((val) =>
      this.activRoute = _route.url

    )

  }

  navigationItems: {
    label: string;
    link: string;
    iconPath: string;
  }[] = [
      {
        label: 'Profile Overview',
        link: '/profile/overview',
        iconPath: 'assets/media/svg/icons/Design/Layers.svg'
      },
      {
        label: 'Personal Information',
        link: '/profile/info',
        iconPath: 'assets/media/svg/icons/General/User.svg',
      },
      {
        label: 'Account Information',
        link: '/profile/acc-info',
        iconPath: 'assets/media/svg/icons/Code/Compiling.svg'
      },
      {
        label: 'Change Password',
        link: 'change-password',
        iconPath: 'assets/media/svg/icons/Communication/Shield-user.svg'
      }
    ];

}

