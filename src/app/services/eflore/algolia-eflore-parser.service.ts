import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';


import { EfloreCard } from '../../model/eflore/eflore-card.model';

@Injectable({
  providedIn: 'root'
})
// @todo make this an .utils
export class AlgoliaEfloreParserService {

    parseEfloreCard(algoliaResponse, taxoRepo) {

        const efloreCard = new EfloreCard();

        const firstHit = algoliaResponse.results[0].hits[0];
        console.debug(firstHit);
        if ( firstHit != null ) {
            const efloreEncodedCard = firstHit[taxoRepo];

            if ( firstHit[taxoRepo] != null ) {
                efloreCard.common_names = efloreEncodedCard.common_name.split(',');
                efloreCard.author = efloreEncodedCard.author;
                efloreCard.biblio = efloreEncodedCard.biblio;
                efloreCard.genus = efloreEncodedCard.genus;
                efloreCard.permalink = efloreEncodedCard.permalink;
                efloreCard.scientific_name = efloreEncodedCard.scientific_name;
                efloreCard.supra_genus_name = efloreEncodedCard.supra_genus_name;
                efloreCard.author = efloreEncodedCard.author;
                // Let's handle thumbnails:
                if ( efloreEncodedCard.thumbnails != null ) {
                    if ( efloreEncodedCard.thumbnails.chorodep != null ) {
                        efloreCard.chorodepMapUrl = efloreEncodedCard.thumbnails.chorodep;
                    }
                    if ( efloreEncodedCard.thumbnails.cel != null ) {
                        const celThumbnails = efloreEncodedCard.thumbnails.cel;
                        const celPhotoUrls = [];

                        for (const celImgUrl of efloreEncodedCard.thumbnails.cel) {
                            celPhotoUrls.push(celImgUrl);
                        }

                        for (const key in celThumbnails) {
                            if (celThumbnails.hasOwnProperty(key)) {
                                celPhotoUrls.push(celThumbnails[key]);
                            }
                        }
                        efloreCard.celPhotoUrls = celPhotoUrls;
                    }


                }
                console.debug(efloreCard);
            }
        }
        return efloreCard;

    }


  constructor(private http: HttpClient) { }
}
