export class JsonPatchOperation{
    // all properties but op are optional
    op:string;
    path?:string;
    value?:string;
    from?:string;    
}

