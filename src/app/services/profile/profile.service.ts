import {
    Injectable
}
from '@angular/core';
import {
    Observable
}
from "rxjs/Observable";
import {
    HttpClient,
    HttpParams
}
from "@angular/common/http";

import {
    environment
} from '../../../environments/environment';
import {
    Profile
}
from "../../model/profile/profile.model";

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    private resourceUrl = environment.api.baseUrl + '/user_profile_cels';

    constructor(private http: HttpClient) {}

    get(id): Observable < Profile > {
        return this.http.get < Profile > (this.resourceUrl + '/' + id, {
            headers: {
                'Accept': 'application/json'
            }
        });
    }


    findByUserId(userId: number): Observable < Profile[] > {

        let httpParams = new HttpParams().append('userId', String(userId));

        return this.http.get < Profile[] > (this.resourceUrl, {
            params: httpParams,
            headers: {
                'Accept': 'application/json'
            }
        });
    }


    post(profile: Profile) {
        return this.http.post < Profile > (
            this.resourceUrl,
            profile, {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );
    }


    patch(profile: Profile): Observable < Profile > {
        return this.http.patch < Profile > (
            this.resourceUrl + '/' + profile.id,
            profile, {
                headers: {
                    'Accept': 'application/json'
                }
            });
    }

    delete(id) {
        return this.http.delete < Profile > (this.resourceUrl + '/' + id, {
            headers: {
                'Accept': 'application/json'
            }
        });
    }

}
