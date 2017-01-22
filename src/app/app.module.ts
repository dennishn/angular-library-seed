import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpModule, Http, RequestOptions} from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import {NHttpModule} from '../../n-http';
// import { SampleComponent } from './components/sample.component';
// import { SampleDirective } from './directives/sample.directive';
// import { SamplePipe } from './pipes/sample.pipe';
// import { SampleService } from './services/sample.service';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';
import {NHttpConfig} from "../../lib/n-http.config";
import {NHttp} from "../../lib/n-http.service";

export function NHttpServiceFactory(http: Http, options: RequestOptions) {
  return new NHttp(new NHttpConfig({
    globalHeaders: [{
      'foo': 'bar'
    }]
  }), http, options);
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
    {
      provide: NHttp,
      useFactory: NHttpServiceFactory,
      deps: [Http, RequestOptions]
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
