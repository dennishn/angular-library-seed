import {NgModule, ModuleWithProviders, Provider, Optional, SkipSelf} from '@angular/core';
import {HttpModule, Http, RequestOptions} from '@angular/http'

import {NHttpConfig, INHttpConfig} from './lib/n-http.config';
import { NHttp } from './lib/n-http.service';

// for manual imports
export * from './lib/index';

export const N_HTTP_PROVIDERS: Provider[] = [
  {
    provide: NHttp,
    deps: [Http, RequestOptions],
    useFactory: (http: Http, options: RequestOptions) => {
      return new NHttp(new NHttpConfig(), http, options);
    }
  }
];

export function provideNHttp(config?: INHttpConfig): Provider[] {
  return [
    {
      provide: NHttp,
      deps: [Http, RequestOptions],
      useFactory: (http: Http, options: RequestOptions) => {
        return new NHttp(new NHttpConfig(config), http, options);
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
