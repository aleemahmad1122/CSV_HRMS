import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { InterceptorService } from './shared/interceptors/interceptor.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/language/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    provideToastr({
      // Notification display duration
      timeOut: 5000,

      // Visual positioning
      positionClass: 'toast-top-right',

      // Prevent multiple identical notifications
      preventDuplicates: true,

      // Visual enhancements
      closeButton: true,
      progressBar: true,
      progressAnimation: 'increasing',

      // Allow dismissing by clicking
      tapToDismiss: true,

      // Additional aesthetic improvements
      toastClass: 'ngx-toastr',
      titleClass: 'toast-title',
      messageClass: 'toast-message',

      // Easing and animation
      easing: 'ease-in',
      easeTime: 300,

      // Maximum number of toasts
      maxOpened: 3,
      autoDismiss: true
    }),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      })
    ),
    { provide:HTTP_INTERCEPTORS, useClass:InterceptorService, multi:true },
  ]
};
