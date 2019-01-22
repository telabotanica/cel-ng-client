import { Injectable } 
  from '@angular/core';
import { Observable } 
  from "rxjs/Observable";
import { HttpClient, HttpParams } 
  from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { Photo } 
  from "../../model/photo/photo.model";
import { PhotoFilters } 
  from "../../model/photo/photo-filters.model";
import { JsonPatchService } 
  from "../../../restit/services/json-patch.service";
import { JsonPatchResponse } 
  from '../../../restit/model/json-patch-response.model';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  private resourceUrl = environment.api.baseUrl + '/photos';

  getCollection(
    sortBy:string = "dateShot",
    sortDirection:string = "desc",
    filters: PhotoFilters = null):  Observable<Photo[]> {

    let httpParams= new HttpParams();

    if ( sortBy !== null && sortBy !== "") {
        httpParams = httpParams.append("sortBy", sortBy);
    }
    if ( sortDirection !== null && sortBy !== "") {
        httpParams = httpParams.append("sortDirection", sortDirection);
    }
    if ( filters !== null ) {
      
      for (var propertyName in filters) {
        if (filters.hasOwnProperty(propertyName) && ! (filters[propertyName] == null)) {
          httpParams = httpParams.append(
            propertyName, filters[propertyName].toString()
          );
        }
      }
    }

    return this.http.get<Photo[]>(this.resourceUrl + ".json", {
        params: httpParams
    });

  }

  get(id) : Observable<Photo>{
    return this.http.get<Photo>(this.resourceUrl + '/' + id, {
      headers: {'Accept':'application/json'}
    });
  }

  patch(id, values) : Observable<Photo>{
    return this.http.patch<Photo>(
      this.resourceUrl + '/' + id, 
      values,
      { headers: {'Accept':'application/json'} });
  }

  delete(id) {
    return this.http.delete<Photo>(this.resourceUrl + '/' + id, {
      headers: {'Accept':'application/json'}
    });
  }

  download(ids) {

    let httpParams= new HttpParams();

    for (let id of ids) {
      httpParams = httpParams.append('id[]', id);
    } 

    return this.http.get(this.resourceUrl + '/download', {
      params: httpParams,
      // this is what we really want but ng ony wants json or arraybuffer...
      // responseType: 'application/zip' 
      responseType: 'arraybuffer',
    });
  }

  bulkReplace(ids, value): Observable<JsonPatchResponse[]> {
    this.jsonPatchService.resourceServiceUrl = this.resourceUrl;
    return this.jsonPatchService.bulkReplace(ids, value);
  }

  bulkRemove(ids): Observable<JsonPatchResponse[]> {
    this.jsonPatchService.resourceServiceUrl = this.resourceUrl; 
    return this.jsonPatchService.bulkRemove(ids);
  }
/*
    bulkAssociateTags(ids): Observable<JsonPatchResponse[]> {
        this.jsonPatchService.resourceServiceUrl = this.resourceUrl; 
        return this.jsonPatchService.bulkRemove(ids);        
    }
*/

  constructor(private http:HttpClient, private jsonPatchService:JsonPatchService) { }
}
