import {Injectable} from "@angular/core";
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpParams, HttpHeaders} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map, catchError, finalize} from "rxjs/operators";
import {of} from "rxjs/observable/of";

import { JsonPatchResponse } from '../model/json-patch-response.model';
import { JsonPatchOperation } from '../model/json-patch-operation.model'; 

@Injectable()
export class JsonPatchService{

    private _resourceServiceUrl: string = "";
    private _resourceBasePath: string = "";

    constructor(private http:HttpClient) {

    }

    set resourceServiceUrl(resourceServiceUrl:string) {
        this._resourceServiceUrl = resourceServiceUrl;
        this._resourceBasePath = this.extractPath(resourceServiceUrl);
    }

    //@refactor put this in a UrlUtils class
    private extractPath(url){
        return  url.replace( /^[a-zA-Z]{3,5}\:\/{2}[a-zA-Z0-9_.:-]+/, '' );
    }

    private buildBulkOperation(path, op, value, from) {
        let operation = new JsonPatchOperation();
        operation.op = op;

        // Value is not mandatory (e.g. for remove operations):
        if (value) {
            operation.value = value;
        }
        // Path is not mandatory (e.g. for copy operations):
        if (path) {
            operation.path = path;
        }
        // From is only required for copy operations:
        if (from) {
            operation.from = from;
        }
        return operation;
    }

    private buildPath(id) { 
        return(this._resourceBasePath + "/" + id);
    }

    private buildRemoveOperation(id) {
        let path = this.buildPath(id);
        return this.buildBulkOperation(path, 'remove', null, null);
    }

    private buildReplaceOperation(id, value) {
        let path = this.buildPath(id);
        return this.buildBulkOperation(path, 'replace', value, null);
    }

    private buildCopyOperation(id) {
        let path = this.buildPath(id);
        return this.buildBulkOperation(null, 'copy', null, path);
    }

    bulkRemove(ids):  Observable<JsonPatchResponse[]> {
        let operations = ids.map(function(id) {
          return this.buildRemoveOperation(id);
        }, this);

        return this.bulkOperation(operations);
    }

    bulkCopy(ids):  Observable<JsonPatchResponse[]> {
        let operations = ids.map(function(id) {
          return this.buildCopyOperation(id);
        }, this);

        return this.bulkOperation(operations);
    }

    bulkOperation(atomicOperations):  Observable<JsonPatchResponse[]>  {

        return this.http.patch<JsonPatchResponse[]>(
            this._resourceServiceUrl, 
            atomicOperations,
            {
                headers: {'Content-Type':'application/json-patch+json'}
            }
        );
    }

    bulkReplace(ids, value):  Observable<JsonPatchResponse[]> {
        let operations = ids.map(function(id) {
          return this.buildReplaceOperation(id, value);
        }, this);

        return this.bulkOperation(operations);
    }


}
