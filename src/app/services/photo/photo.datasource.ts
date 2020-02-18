import {Injectable} from "@angular/core";
import { environment } from '../../../environments/environment';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map, catchError, finalize} from "rxjs/operators";
import {of} from "rxjs/observable/of"; 
 
import {Photo} from "../../model/photo/photo.model";

// @todo: refactor this by making a generic superclass
// @todo: unused class, check for deletion
@Injectable()
export class PhotoDataSource implements DataSource<Photo> {




    // The array of Occurrence instances retrieved from the Web service:
    public resourcesSubject = new BehaviorSubject<Photo[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private resourceUrl = environment.api.baseUrl + '/photos';

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
