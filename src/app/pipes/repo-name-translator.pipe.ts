import { Pipe, PipeTransform } from '@angular/core';

import { environment } from '../../environments/environment';

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'repoNameTranslator'})
export class RepoNameTranslatorPipe implements PipeTransform {

    private taxoCodeNamemapping;

  constructor() {
    let tbRepositoriesConfig = environment.tbTsbLib.tbRepositoriesConfig;
    this.taxoCodeNamemapping = {};
    for ( let entry of tbRepositoriesConfig ) {
        this.taxoCodeNamemapping[entry['id']] = entry['label'];
    }

  }


  transform(value: string): string {
    if ( value in this.taxoCodeNamemapping) {
        return this.taxoCodeNamemapping[value];
    }   
    return 'Autre/inconnu';
  }

}
