import {Injectable} from "@angular/core";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map, catchError, finalize} from "rxjs/operators";
import {of} from "rxjs/observable/of";

//import { AppConfig } from "../../app.config";
import {Photo} from "../../model/photo/photo.model";

// @todo: refactor this by making a generic superclass
@Injectable()
export class PhotoDataSource implements DataSource<Photo> {

    // The array of Occurrence instances retrieved from the Web service:
    public resourcesSubject = new BehaviorSubject<Photo[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private resourceUrl = 'http://localhost:8080/api/photos';

    constructor(private http:HttpClient) {

    }

    find(sortProperty = '', sortOrder = 'asc',
        pageNumber = 0, pageSize = 3):  Observable<Photo[]> {
        return this.http.get<Photo[]>(this.resourceUrl + '.json', {
            params: new HttpParams()
                //.set('filter', filter)
                .set('orderBy', sortProperty)
                .set('sortOrder', sortOrder)
                .set('pageNumber', pageNumber.toString())
                .set('pageSize', pageSize.toString())
        });


    }


    load(sortProperty:string,
                sortDirection:string,
                pageIndex:number,
                pageSize:number) {

        this.loadingSubject.next(true);

        this.find(sortProperty, sortDirection,
            pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(resources => {
              this.resourcesSubject.next(resources);
            });

    }
  
    connect(collectionViewer: CollectionViewer): Observable<Photo[]> {
        console.log("Connecting data source");
        return this.resourcesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.resourcesSubject.complete();
        this.loadingSubject.complete();
    }

}
