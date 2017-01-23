import {Injectable} from '@angular/core';

import {ResponseOptions, RequestOptionsArgs} from '@angular/http';
import {Headers} from '@angular/http';
import {Response} from '@angular/http';
import {BrowserXhr} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/finally';
import {NHttpConfig} from "./n-http.config";

// Annoying that these arent exposed ... Also annoying that they don't contain a "progress" type - as that is VALID!
enum ResponseType {
    Basic = 0,
    Cors = 1,
    Default = 2,
    Error = 3,
    Opaque = 4,
    Progress = 5
}

@Injectable()
export class NHttpUpload {

    progressSubject = new Subject<any>();
    progress$: Observable<any>;

    constructor(options: NHttpConfig, private browserXhr: BrowserXhr) {
        this.progress$ = this.progressSubject.asObservable();
    }

    upload(url: string, body: any, options?: RequestOptionsArgs) {

        return new Observable<Response>((responseObserver: Observer<Response>) => {

            const _xhr: XMLHttpRequest = this.browserXhr.build();

            const method = 'POST';

            _xhr.open(method, url);

            const onLoad = () => {

                const headers: Headers = Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
                const responseUrl: string = this._getResponseURL(_xhr) || url;

                let responseOptions = new ResponseOptions({
                    body: _xhr.response,
                    status: _xhr.status,
                    headers: headers,
                    type: ResponseType.Default,
                    statusText: _xhr.statusText || 'OK',
                    url: responseUrl
                });

                let response = new Response(responseOptions);

                response.ok = (_xhr.status >= 200 && _xhr.status < 300);

                if(response.ok) {
                    responseObserver.next(response);
                    responseObserver.complete();
                    return;
                }

                responseObserver.error(response);

            };

            const onError = (err: ErrorEvent) => {

                let responseOptions = new ResponseOptions({
                    body: err,
                    type: ResponseType.Error,
                    status: _xhr.status,
                    statusText: _xhr.statusText
                });

                responseObserver.error(new Response(responseOptions));

            };

            const onProgress = (progress: ProgressEvent) => {

                const percentageComplete = Math.round(progress.loaded / progress.total * 100);

                let responseOptions = new ResponseOptions({
                    body: percentageComplete,
                    type: ResponseType.Progress,
                    status: _xhr.status,
                    statusText: _xhr.statusText
                });

                // For anyone subscribing to the NHttpUpload service' progress$ Observable
                this.progressSubject.next(percentageComplete);

                // For the callee of the .uploadFile method
                responseObserver.next(new Response(responseOptions));
            };

            if(options.headers) {
                options.headers.forEach((values, name) => _xhr.setRequestHeader(name, values.join(',')));
            }

            _xhr.addEventListener('load', onLoad);
            _xhr.addEventListener('error', onError);
            _xhr.upload.addEventListener('progress', onProgress);

            _xhr.send(body);

            return () => {
                _xhr.removeEventListener('load', onLoad);
                _xhr.removeEventListener('error', onError);
                _xhr.upload.removeEventListener('progress', onProgress);
                _xhr.abort();
            };

        });

    }

    // More "hidden" gems in the Http files in Angular ... They really dont want to make it easy :(
    private _getResponseURL(xhr: any): string {
        if ('responseURL' in xhr) {
            return xhr.responseURL;
        }
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
            return xhr.getResponseHeader('X-Request-URL');
        }
        return;
    }

}
