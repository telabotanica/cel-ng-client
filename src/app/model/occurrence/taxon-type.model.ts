

interface TaxonType {
  occurenceId?: number;
  repository: string;
  idNomen: number | string;
  idTaxo?: number | string;
  name: string;
  author: string;
  isSynonym?: boolean;
  rawData?: any;
  validOccurence: TaxonType;
}
