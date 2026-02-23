import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { finalize } from 'rxjs/operators';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const ngxService = inject(NgxUiLoaderService);
  
  ngxService.start();
  
  return next(req).pipe(
    finalize(() => {
      ngxService.stop();
    })
  );
};
