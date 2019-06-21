export interface JsonPatchResponse {
    op?:string;
    path?:string;
    value?:string;
    from?:string;    
    index?:string
    status?:number
    message?:any
}

