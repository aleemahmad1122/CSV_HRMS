import { Component, Inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { DataShareService } from '../../Services/data-share.service';
import { FilterPipe } from '../../pipes/filter.pipe';
import { HighlightPipe } from '../../pipes/highlight.pipe';
import { FormsModule } from '@angular/forms';
import { LocalStorageManagerService } from "../../Services/local-storage-manager.service"
import { EmployeeDetail } from '../../../types';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FilterPipe, HighlightPipe, FormsModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {
  user: EmployeeDetail;
  currentLang = 'en';
  currentLangFlag = '226-united-states.svg';
  Lang = 'en';
  languages = [
    { code: 'en', name: 'language.en', flag: '226-united-states.svg' },
    { code: 'ar', name: 'language.ar', flag: '008-saudi-arabia.svg' },
    { code: 'es', name: 'language.es', flag: '128-spain.svg' },
    { code: 'fr', name: 'language.fr', flag: '195-france.svg' },
    { code: 'de', name: 'language.de', flag: '162-germany.svg' },
    { code: 'ja', name: 'language.ja', flag: '063-japan.svg' }
  ];

  constructor(
    public _translateService: TranslateService,
    public _localStorage : LocalStorageManagerService
  ) {
    _translateService.addLangs(['en', 'ar', 'es', 'fr', 'de', 'ja']);
    _translateService.setDefaultLang('en');
    const browserLang = _translateService.getBrowserLang();
    _translateService.use(browserLang?.match(/en|ar|es|fr|de|ja/) ? browserLang : 'en');

    this.user = this._localStorage.getEmployeeDetail()[0];

  }

  changeLang(langCode: string): void {
    this.currentLang = langCode;
    const selectedLang = this.languages.find(lang => lang.code === langCode);
    if (selectedLang) {
      this.currentLangFlag = selectedLang.flag;
    }
    switch (langCode) {
      case 'en': this.currentLangFlag = '226-united-states.svg'; break;
      case 'ar': this.currentLangFlag = '008-saudi-arabia.svg'; break;
      case 'es': this.currentLangFlag = '128-spain.svg'; break;
      case 'fr': this.currentLangFlag = '195-france.svg'; break;
      case 'de': this.currentLangFlag = '162-germany.svg'; break;
      case 'ja': this.currentLangFlag = '063-japan.svg'; break;
    }

    this._translateService.use(langCode);
    this.Lang = langCode;

    // Removed HTML direction change
    // let htmlTag = this._document.getElementsByTagName('html')[0] as HTMLHtmlElement;
    // htmlTag.dir = langCode === 'ar' ? 'rtl' : 'ltr';

    this._translateService.setDefaultLang(langCode);
    this._translateService.use(langCode);
    // this.changeCssFile(lang);
  }
}
