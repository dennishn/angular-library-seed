import { Component } from '@angular/core';

import '../style/app.scss';
import {NHttp} from "../../lib/n-http.service";
import {Headers} from "@angular/http";

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  pipeTest: string = 'Create an amazing community by contributing a library';
  url: string = 'https://github.com/preboot/angular-library-seed';

  constructor(private http: NHttp) {
    let myHeader = new Headers();
    myHeader.append('X-Foo', 'application/json');
    // Do something with sampleService
    http.get('www.google.com', {headers: myHeader})
        .subscribe(
            res => console.info(res),
            err => console.warn(err)
        )
  }
}
