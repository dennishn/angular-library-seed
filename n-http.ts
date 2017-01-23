import {NgModule, ModuleWithProviders, Provider, Optional, SkipSelf, ErrorHandler} from '@angular/core';
import {HttpModule, Http, RequestOptions, BrowserXhr} from '@angular/http'

import {NHttpConfig, INHttpConfig} from './lib/n-http.config';
import { NHttp } from './lib/n-http.service';
import {NHttpUpload} from "./lib/n-http-fileupload.service";

// for manual imports
export * from './lib/index';

export const N_HTTP_PROVIDERS: Provider[] = [
  {
    provide: NHttp,
    deps: [Http, RequestOptions, ErrorHandler],
    useFactory: (http: Http, errorHandler: ErrorHandler, options: RequestOptions) => {
      return new NHttp(new NHttpConfig(), http, errorHandler, options);
    }
  }
];

export function provideNHttp(config?: INHttpConfig): Provider[] {
  return [
    {
      provide: NHttp,
      deps: [Http, RequestOptions, ErrorHandler],
      useFactory: (http: Http, errorHandler: ErrorHandler, options: RequestOptions) => {
        return new NHttp(new NHttpConfig(config), http, errorHandler, options);
      }
    }
  ];
}

@NgModule({
  imports: [HttpModule],
  providers: [
    NHttp
  ],
})
export class NHttpModule {

  constructor(@Optional() @SkipSelf() parentModule: NHttpModule) {
    if (parentModule) {
      throw new Error(
          'NHttpModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(config: INHttpConfig): ModuleWithProviders {
    return {
      ngModule: NHttpModule,
      providers: [
        {provide: NHttpConfig, useValue: config}
      ]
    };
  }
}
