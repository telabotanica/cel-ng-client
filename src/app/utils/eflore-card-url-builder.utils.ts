import { environment } from '../../environments/environment';

export class EfloreCardUrlBuilder {

  // Too bad we cannot use ` in JSON. Therefore, we cannot use the string
  // template magic...
  static efloreUrlTemplate: string = environment.eflore.baseUrlTemplate;

  static build(taxoRepoName, taxonId) {
    let url = EfloreCardUrlBuilder.efloreUrlTemplate;
    const re1 = /\${taxoRepoName}/gi;
    const re2 = /\${taxonId}/gi;
    url = url.replace(re1, taxoRepoName);
    url = url.replace(re2, taxonId);

    return url;
  }

}
