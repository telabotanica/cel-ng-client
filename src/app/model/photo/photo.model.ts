import { Occurrence } from "../../model/occurrence/occurrence.model";

export class Photo {

    id: number;
    originalName: string;
    url: string;
    contentUrl: Date;
    dateCreated: Date;
    dateUpdated: Date;
    dateLinkedToOccurrence: Date;
    dateShot: Date;
    occurrence: Occurrence;
    mimeType: string;
    size: number;    

} 
