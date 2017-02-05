import {Injectable, ErrorHandler} from '@angular/core';
import {
    Http, RequestOptions, RequestOptionsArgs, Request, Headers, Response, RequestMethod,
    ResponseType, ResponseOptions
} from '@angular/http';

import {INHttpConfig, NHttpConfig} from './n-http.config';

import {Observable, Subject, Observer} from 'rxjs/Rx';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

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
export class NHttp {

    private config: INHttpConfig;

    progressSubject = new Subject<any>();
    progress$: Observable<any>;

    // IMPORT BROWSER XHR...
    constructor(options: NHttpConfig, private http: Http, private errorHandler: ErrorHandler, private defOpts?: RequestOptions) {
        this.config = options.getConfig();
        this.progress$ = this.progressSubject.asObservable();
    }

    private mergeOptions(providedOpts: RequestOptionsArgs, defaultOpts?: RequestOptions) {
        let newOptions = defaultOpts || new RequestOptions();
        if(this.config.globalHeaders) {
            this.setGlobalHeaders(this.config.globalHeaders, providedOpts);
        }
        if(this.config.nMeta.disable === false) {
            const nMetaHeader = this.buildNMetaHeader(this.config);
            this.setGlobalHeaders([nMetaHeader], providedOpts);
        }

        newOptions = newOptions.merge(new RequestOptions(providedOpts));

        return newOptions;
    }

    private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
        let options = new RequestOptions(requestArgs);
        if (additionalOptions) {
            options = options.merge(additionalOptions);
        }
        return this.request(new Request(this.mergeOptions(options, this.defOpts)));
    }

    private buildNMetaHeader(options: INHttpConfig) {
        return {'N-Meta': [options.nMeta.platform, options.nMeta.environment].join(';')};
    }

    // More "hidden" gems in the Http files in Angular ... They really dont want to make it easy :(
    private getResponseURL(xhr: any): string {
        if ('responseURL' in xhr) {
            return xhr.responseURL;
        }
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
            return xhr.getResponseHeader('X-Request-URL');
        }
        return;
    }

    public setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
        if (!request.headers) {
            request.headers = new Headers();
        }
        headers.forEach((header: Object) => {
            let key: string = Object.keys(header)[0];
            let headerValue: string = (header as any)[key];
            (request.headers as Headers).set(key, headerValue);
        });
    }

    public request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        if (typeof url === 'string') {
            return this.get(url, options); // Recursion: transform url from String to Request
        }
        // else if ( ! url instanceof Request ) {
        //   throw new Error('First argument must be a url string or Request instance.');
        // }

        // from this point url is always an instance of Request;
        let req: Request = url as Request;

        return this.http.request(req).catch((error: Response) => {
            // Forward 500+ errors to error handler
            if(error.status >= 500) {
                this.errorHandler.handleError(error.toString());
            }
            return Observable.throw(error);
        });
    }

    public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Get, url: url }, options);
    }

    public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Post, url: url }, options);
    }

    public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Put, url: url }, options);
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Delete, url: url }, options);
    }

    public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Patch, url: url }, options);
    }

    public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Head, url: url }, options);
    }

    public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Options, url: url }, options);
    }

    public upload(url: string, body: any, options?: RequestOptionsArgs) {
        return new Observable<Response>((responseObserver: Observer<Response>) => {

            const _xhr: XMLHttpRequest = this.browserXhr.build();

            const method = 'POST';

            _xhr.open(method, url);

            const onLoad = () => {

                const headers: Headers = Headers.fromResponseHeaderString(_xhr.getAllResponseHeaders());
                const responseUrl: string = this.getResponseURL(_xhr) || url;

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

}