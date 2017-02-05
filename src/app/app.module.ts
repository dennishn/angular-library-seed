import {NgModule, ApplicationRef, ErrorHandler} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpModule, Http, RequestOptions} from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import {NHttpModule} from '../../n-http';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';
import {NHttpConfig} from "../../lib/n-http.config";
import {NHttp} from "../../lib/n-http.service";

import {NErrorHandler} from '../../lib/n-error-handler/n-error-handler';

export function NHttpServiceFactory(http: Http, errorHandler: ErrorHandler, options: RequestOptions) {
  return new NHttp(new NHttpConfig({

  }), http, errorHandler, options);
}

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    // NHttpModule
  ],
  declarations: [
    AppComponent,
    // SampleComponent,
    // SampleDirective,
    // SamplePipe
  ],
  providers: [
    {provide: ErrorHandler, useClass: NErrorHandler},
    {
      provide: NHttp,
      useFactory: NHttpServiceFactory,
      deps: [Http, ErrorHandler, RequestOptions]
    }
    // SampleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    console.log('HMR store', store);
  }
  hmrOnDestroy(store) {
    let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
