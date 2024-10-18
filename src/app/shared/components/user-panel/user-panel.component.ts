import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { UserAuthenticationService } from '../../Services/user-authentication.service';
import { DataShareService } from '../../Services/data-share.service';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [RouterModule, RouterLink],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.css'
})
export class UserPanelComponent {


  constructor(
    private _authService: UserAuthenticationService,
      private _dataShare: DataShareService
  ){}

  logOut():void{
this._authService.logout()
this._dataShare.updateLoginStatus(false);
  }

}
