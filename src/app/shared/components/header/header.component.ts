import * as Components from "../../components/index";
import { Component, Inject, OnInit } from '@angular/core';
import { UserAuthenticationService } from '../../Services/user-authentication.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { DataShareService } from '../../Services/data-share.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [TranslateModule, Components.TopbarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent implements OnInit {
  user: any;
  Lang = 'en';
  constructor(
    private _userAuth: UserAuthenticationService,
    public _translateService: TranslateService,
    @Inject(DOCUMENT) private _document: Document,
    private _dataShare: DataShareService
  ) {
    this.user = _userAuth.getUser();
    _translateService.addLangs(['en', 'ar']);
    _translateService.setDefaultLang('en');
    const browserLang = _translateService.getBrowserLang();
    _translateService.use(browserLang?.match(/en|ar/) ? browserLang : 'en');
  }

  changeLang(lang: string): void {
    this._translateService.use(lang);
    this.Lang = lang;
    let htmlTag = this._document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    htmlTag.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this._translateService.setDefaultLang(lang);
    this._translateService.use(lang);
    // this.changeCssFile(lang);
  }

  ngOnInit(): void {

  }

  logout(): void {
    this._userAuth.logout();
    this._dataShare.updateLoginStatus(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

}
