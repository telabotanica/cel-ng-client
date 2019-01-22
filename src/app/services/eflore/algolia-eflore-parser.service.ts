import { Injectable } from '@angular/core';

import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";


import { EfloreCard } from "../../model/eflore/eflore-card.model";

@Injectable({
  providedIn: 'root'
})
//@todo make this an .utils
export class AlgoliaEfloreParserService {

    parseEfloreCard(algoliaResponse, taxoRepo) {

        let efloreCard = new EfloreCard();

        let firstHit = algoliaResponse.results[0].hits[0];
        console.debug(firstHit);

        let efloreEncodedCard = firstHit[taxoRepo];
        efloreCard.common_names = efloreEncodedCard.common_name.split(',');
        efloreCard.author = efloreEncodedCard.author;
        efloreCard.biblio = efloreEncodedCard.biblio;
        efloreCard.genus = efloreEncodedCard.genus;
        efloreCard.permalink = efloreEncodedCard.permalink;
        efloreCard.supra_genus_name = efloreEncodedCard.supra_genus_name;
        efloreCard.author = efloreEncodedCard.author;
        efloreCard.chorodepMapUrl = efloreEncodedCard.thumbnails.chorodep;
        let celThumbnails = efloreEncodedCard.thumbnails.cel;
        let celPhotoUrls = [];

        for (let celImgUrl of efloreEncodedCard.thumbnails.cel) {
            celPhotoUrls.push(celImgUrl)
        }

        for (var key in celThumbnails) {
            if (celThumbnails.hasOwnProperty(key)) {
                celPhotoUrls.push(celThumbnails[key]);
            }
        }

        efloreCard.celPhotoUrls = celPhotoUrls;
        efloreCard.chorodepMapUrl = efloreEncodedCard.thumbnails.chorodep;
        console.debug(efloreCard);

         return efloreCard;

    }


  constructor(private http:HttpClient) { }
}
