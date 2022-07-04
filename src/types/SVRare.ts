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

export type PedigreeMember = {
  name: string,
  display_name?: string,
  level: number,
  [disease: string]: any,
  sex: 'M' | 'F' | null,
  mother?: string,
  father?: string,
  proband?: boolean,
  top_level?: boolean,
  age?: number,
  status?: number
}