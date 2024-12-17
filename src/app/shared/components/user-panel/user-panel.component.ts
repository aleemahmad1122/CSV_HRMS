import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { UserAuthenticationService } from '../../Services/user-authentication.service';
import { DataShareService } from '../../Services/data-share.service';
import { EmployeeDetail } from '../../../types/index';
import { LocalStorageManagerService } from "../../Services/local-storage-manager.service"
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-panel',
  standalone: true,
  imports: [RouterModule, RouterLink,TranslateModule],
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.css'
})
export class UserPanelComponent {


  user: EmployeeDetail;

  constructor(
    private _authService: UserAuthenticationService,
    private _dataShare: DataShareService,
    private _localStrong: LocalStorageManagerService,
  ) {
    this.user = this._localStrong.getEmployeeDetail()[0]
  }

  logOut(): void {
    this._authService.logout()
    this._dataShare.updateLoginStatus(false);
  }

}
