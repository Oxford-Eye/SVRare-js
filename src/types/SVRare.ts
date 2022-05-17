export type SVCarrier = {
  chrom: string,
  start: number,
  end: number,
  sv_type: string,
  name: string,
  family_id: string,
  genotype: string,
  is_proband: boolean,
  filter: string | null,
  relation_to_proband: string,
  disease: string,
  similarity: number,
}