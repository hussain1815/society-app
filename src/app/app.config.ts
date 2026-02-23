import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  NgxUiLoaderModule,
  NgxUiLoaderConfig,
  SPINNER,
  POSITION,
  PB_DIRECTION,
} from 'ngx-ui-loader';
import { routes } from './app.routes';
import { loaderInterceptor } from './interceptors/loader.interceptor';
import { authInterceptor } from './interceptors/auth.interceptor';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
 bgsColor: "red",
  bgsPosition: POSITION.bottomCenter,
  bgsSize: 10,
  bgsType: SPINNER.rectangleBounce, 
  fgsType: SPINNER.squareJellyBox, 
  pbDirection: PB_DIRECTION.leftToRight, 
  pbThickness: 5
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, loaderInterceptor])),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      NgxUiLoaderModule.forRoot(ngxUiLoaderConfig)
    ),
  ]
};
