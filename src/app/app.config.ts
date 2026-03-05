import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { withCredentialsInterceptor } from './core/http/with-credentials.interceptor';
import { CasesRepository } from './features/cases/application/ports/cases.repository';
import { CasesHttpRepository } from './features/cases/infrastructure/repositories/cases-http.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([withCredentialsInterceptor])),
    provideClientHydration(withEventReplay()),
    {
      provide: CasesRepository,
      useClass: CasesHttpRepository,
    },
  ],
};
