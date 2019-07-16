import { Injectable } 
  from '@angular/core';
import { Observable } 
  from "rxjs/Observable";
import { HttpClient, HttpParams } 
  from "@angular/common/http";
import { environment } from '../../../environments/environment';
import { PhotoRotation } 
  from "../../model/photo/photo-rotation.model";

@Injectable({
  providedIn: 'root'
})
export class PhotoRotationService {

  private resourceUrl = environment.api.baseUrl + '/photo_rotations';

  post(photoId):  Observable<PhotoRotation> {

    let httpParams= new HttpParams()
            .set('photoId', photoId);

    return this.http.post<PhotoRotation>(this.resourceUrl, null, {
        params: httpParams
    });

  }

  constructor(private http:HttpClient) { }

}
