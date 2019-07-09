import {Injectable} from "@angular/core";
import { environment } from '../../../environments/environment';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map, catchError, finalize} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import 'rxjs/Rx' ;

import { Occurrence } from "../../model/occurrence/occurrence.model";
import { Photo } from "../../model/photo/photo.model";
import { OccurrenceFilters } from "../../model/occurrence/occurrence-filters.model";
import { JsonPatchService } from "../../../restit/services/json-patch.service";
import { JsonPatchResponse } from '../../../restit/model/json-patch-response.model';

//@todo refactor this ugly mess!
@Injectable()
export class OccurrencesDataSource implements DataSource<Occurrence> {

    // The array of Occurrence instances retrieved from the Web service:
    public occurrencesSubject = new BehaviorSubject<Occurrence[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();
    private resourceUrl = environment.api.baseUrl + '/occurrences';
    private photoSubresourceSubpathEndpoint = '/photos';

    constructor(private http:HttpClient, private jsonPatchService:JsonPatchService) {

    }

    getPhotos(id) : Observable<Photo[]>{
        let endpoint = this.resourceUrl + '/' + id + this.photoSubresourceSubpathEndpoint;
        return this.http.get<Photo[]>(endpoint, {
            headers: {'Accept':'application/json'}
        });
    }

    findCount(filters: OccurrenceFilters = null) {
        console.debug(filters);
        let httpParams = this.buildParams(filters);

        return this.http.get(this.resourceUrl + '.json', {
            params: httpParams,
            observe: 'response'
        });
    }

    findOccurrences(sortBy = '', sortDirection = 'asc',
        pageNumber = 0, pageSize = 10, filters: OccurrenceFilters = null):  Observable<Occurrence[]> {

        let httpParams = this.buildParams(filters)
            .set('sortBy', sortBy)
            .set('sortDirection', sortDirection)
            .set('page', pageNumber.toString())
            .set('perPage', pageSize.toString());

        return this.http.get<Occurrence[]>(this.resourceUrl + '.json', {
            params: httpParams
        });


    }

    //@todo promote all this to its own reusable service:
    // If we use this, the multivalued parameter are sent as e.g. ids[]=13,15. 
    // We want ids[]=13&ids[]=15 instead so we use buildIdsUrlParams(ids).
    private buildIdsParams(ids) {
        let params = new HttpParams();
        ids.forEach(function (id) {
          params = params.append('id[]', id);
        });
        return params;
    }


    //@todo merge with getCollection and add/use as a switch the Accept mimetype 
    generatePdfEtiquette(ids) {
        let params = this.buildIdsParams(ids);
console.debug(params);
        return this.http.get(this.resourceUrl, {
            params: params,
            responseType: 'arraybuffer',
            headers: {'Accept':'application/pdf'}
        });
    }


   generatePdfEtiquetteUrl(ids) {
        let params = this.buildIdsParams(ids);
        return this.resourceUrl + '/' + params.toString();
    }

    get(id) : Observable<Occurrence>{
        return this.http.get<Occurrence>(this.resourceUrl + '/' + id, {
            headers: {'Accept':'application/json'}
        });
    }

    delete(id) {
        return this.http.delete<Occurrence>(this.resourceUrl + '/' + id, {
            headers: {'Accept':'application/json'}
        });
    }


    patch(id, values) {
        return this.http.patch<Occurrence>(this.resourceUrl + '/' + id, 
        values,
        {
            headers: {'Accept':'application/json'}
        });
    }

    post(occurrence: Occurrence) {
        return this.http.post<Occurrence>(
            this.resourceUrl, 
            occurrence,
            {
                headers: {'Accept':'application/json'}
            }
        );
    }

    importSpreadsheet(spreadsheetFile) {
        let formData:FormData = new FormData();
        formData.append('file', spreadsheetFile, spreadsheetFile.name);
        let headers = {
            'Accept': 'application/json'
        };

        return this.http.post(this.resourceUrl + '/import', formData, {headers: headers});

    }


    bulkRemove(ids): Observable<JsonPatchResponse[]> {
        this.jsonPatchService.resourceServiceUrl = this.resourceUrl; 
        return this.jsonPatchService.bulkRemove(ids);
    }

    bulkReplace(ids, value): Observable<JsonPatchResponse[]> {
        this.jsonPatchService.resourceServiceUrl = this.resourceUrl; 
         return this.jsonPatchService.bulkReplace(ids, value);
    }

    bulkCopy(ids): Observable<JsonPatchResponse[]> {
        this.jsonPatchService.resourceServiceUrl = this.resourceUrl; 
         return this.jsonPatchService.bulkCopy(ids);
    }

    loadOccurrences(sortProperty:string,
                sortDirection:string,
                pageIndex:number,
                pageSize:number, 
                filters: OccurrenceFilters=null) {

        this.loadingSubject.next(true);

        this.findOccurrences(sortProperty, sortDirection,
            pageIndex, pageSize, filters).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(occurrences => {
              this.occurrencesSubject.next(occurrences);
            });

    }

    connect(collectionViewer: CollectionViewer): Observable<Occurrence[]> {
        console.log("Connecting data source");
        return this.occurrencesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.occurrencesSubject.complete();
        this.loadingSubject.complete();
    }

    export(filters: OccurrenceFilters) {

        let httpParams = this.buildParams(filters);

        return this.http.post(this.resourceUrl + '/export', '', {
            params: httpParams,
            responseType: 'arraybuffer',
            headers: {'Accept':'text/csv'}
        });
    }

   private buildParams(filters: OccurrenceFilters) {
        let httpParams= new HttpParams();
        console.debug(filters);
        if ( filters !== null ) {
            for (var propertyName in filters) {
                if (filters.hasOwnProperty(propertyName) && ! (filters[propertyName] == null)) {
                    if (Array.isArray(filters[propertyName])) {
                        for (var val in filters[propertyName]) {
                            httpParams = httpParams.append(propertyName + '[]', filters[propertyName][val]);
                        }
                    }
                    else {
                        httpParams = httpParams.append(propertyName, filters[propertyName].toString());
                    }
                }
            }
        }
        return httpParams;

    }

}
