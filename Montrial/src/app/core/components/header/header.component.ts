// header.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent { 
  currentLang: string = 'en';
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['en', 'fr']);
    const browserLang = this.translate.getBrowserLang();
    const defaultLang = browserLang?.match(/en|fr/) ? browserLang : 'en';
    this.translate.use(defaultLang);
    this.currentLang = defaultLang;
  }

  switchLanguage(): void {
    const targetLang = this.currentLang === 'en' ? 'fr' : 'en';
    this.translate.use(targetLang).subscribe({
      next: () => {
        this.currentLang = targetLang;
        console.log('Switch successful:', this.currentLang);
      },
      error: (err) => {
        console.error('Check if assets/i18n/' + targetLang + '.json exists!', err);
      }
    });
  }

}