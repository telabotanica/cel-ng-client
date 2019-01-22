import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map, catchError, finalize} from "rxjs/operators";
import {of} from "rxjs/observable/of";

//@todo use this in component
@Injectable({
  providedIn: 'root'
})
export class UserOccurrenceTagService {


    private resourceAsTreeUrl = 'http://localhost:8080/api/userOccurrenceTagTrees';

    getCollectionAsTree() {
        return this.http.get<any[]>(this.resourceAsTreeUrl);
    }


  constructor(private http:HttpClient) { }
}
