import type { Sequelize } from "sequelize";
import { HPO as _HPO } from "./HPO";
import type { HPOAttributes, HPOCreationAttributes } from "./HPO";
import { HPO_HPO as _HPO_HPO } from "./HPO_HPO";
import type { HPO_HPOAttributes, HPO_HPOCreationAttributes } from "./HPO_HPO";
import { HPO_gene as _HPO_gene } from "./HPO_gene";
import type { HPO_geneAttributes, HPO_geneCreationAttributes } from "./HPO_gene";
import { Patient_HPO as _Patient_HPO } from "./Patient_HPO";
import type { Patient_HPOAttributes, Patient_HPOCreationAttributes } from "./Patient_HPO";
import { SV as _SV } from "./SV";
import type { SVAttributes, SVCreationAttributes } from "./SV";
import { SV_cds as _SV_cds } from "./SV_cds";
import type { SV_cdsAttributes, SV_cdsCreationAttributes } from "./SV_cds";
import { SV_exon as _SV_exon } from "./SV_exon";
import type { SV_exonAttributes, SV_exonCreationAttributes } from "./SV_exon";
import { SV_gene as _SV_gene } from "./SV_gene";
import type { SV_geneAttributes, SV_geneCreationAttributes } from "./SV_gene";
import { gene as _gene } from "./gene";
import type { geneAttributes, geneCreationAttributes } from "./gene";
import { patient as _patient } from "./patient";
import type { patientAttributes, patientCreationAttributes } from "./patient";
import { patient_SV as _patient_SV } from "./patient_SV";
import type { patient_SVAttributes, patient_SVCreationAttributes } from "./patient_SV";

export {
  _HPO as HPO,
  _HPO_HPO as HPO_HPO,
  _HPO_gene as HPO_gene,
  _Patient_HPO as Patient_HPO,
  _SV as SV,
  _SV_cds as SV_cds,
  _SV_exon as SV_exon,
  _SV_gene as SV_gene,
  _gene as gene,
  _patient as patient,
  _patient_SV as patient_SV,
};

export type {
  HPOAttributes,
  HPOCreationAttributes,
  HPO_HPOAttributes,
  HPO_HPOCreationAttributes,
  HPO_geneAttributes,
  HPO_geneCreationAttributes,
  Patient_HPOAttributes,
  Patient_HPOCreationAttributes,
  SVAttributes,
  SVCreationAttributes,
  SV_cdsAttributes,
  SV_cdsCreationAttributes,
  SV_exonAttributes,
  SV_exonCreationAttributes,
  SV_geneAttributes,
  SV_geneCreationAttributes,
  geneAttributes,
  geneCreationAttributes,
  patientAttributes,
  patientCreationAttributes,
  patient_SVAttributes,
  patient_SVCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const HPO = _HPO.initModel(sequelize);
  const HPO_HPO = _HPO_HPO.initModel(sequelize);
  const HPO_gene = _HPO_gene.initModel(sequelize);
  const Patient_HPO = _Patient_HPO.initModel(sequelize);
  const SV = _SV.initModel(sequelize);
  const SV_cds = _SV_cds.initModel(sequelize);
  const SV_exon = _SV_exon.initModel(sequelize);
  const SV_gene = _SV_gene.initModel(sequelize);
  const gene = _gene.initModel(sequelize);
  const patient = _patient.initModel(sequelize);
  const patient_SV = _patient_SV.initModel(sequelize);

  HPO_HPO.belongsTo(HPO, { as: "parent_hpo", foreignKey: "parent_hpo_id"});
  HPO.hasMany(HPO_HPO, { as: "HPO_HPOs", foreignKey: "parent_hpo_id"});
  HPO_HPO.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(HPO_HPO, { as: "hpo_HPO_HPOs", foreignKey: "hpo_id"});
  HPO_gene.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(HPO_gene, { as: "HPO_genes", foreignKey: "hpo_id"});
  Patient_HPO.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(Patient_HPO, { as: "Patient_HPOs", foreignKey: "hpo_id"});
  SV_cds.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_cds, { as: "SV_cds", foreignKey: "sv_id"});
  SV_exon.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_exon, { as: "SV_exons", foreignKey: "sv_id"});
  SV_gene.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_gene, { as: "SV_genes", foreignKey: "sv_id"});
  patient_SV.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(patient_SV, { as: "patient_SVs", foreignKey: "sv_id"});
  HPO_gene.belongsTo(gene, { as: "gene", foreignKey: "gene_id"});
  gene.hasMany(HPO_gene, { as: "HPO_genes", foreignKey: "gene_id"});
  SV_cds.belongsTo(gene, { as: "gene", foreignKey: "gene_id"});
  gene.hasMany(SV_cds, { as: "SV_cds", foreignKey: "gene_id"});
  SV_exon.belongsTo(gene, { as: "gene", foreignKey: "gene_id"});
  gene.hasMany(SV_exon, { as: "SV_exons", foreignKey: "gene_id"});
  SV_gene.belongsTo(gene, { as: "gene", foreignKey: "gene_id"});
  gene.hasMany(SV_gene, { as: "SV_genes", foreignKey: "gene_id"});
  Patient_HPO.belongsTo(patient, { as: "patient", foreignKey: "patient_id"});
  patient.hasMany(Patient_HPO, { as: "Patient_HPOs", foreignKey: "patient_id"});
  patient_SV.belongsTo(patient, { as: "patient", foreignKey: "patient_id"});
  patient.hasMany(patient_SV, { as: "patient_SVs", foreignKey: "patient_id"});

  return {
    HPO: HPO,
    HPO_HPO: HPO_HPO,
    HPO_gene: HPO_gene,
    Patient_HPO: Patient_HPO,
    SV: SV,
    SV_cds: SV_cds,
    SV_exon: SV_exon,
    SV_gene: SV_gene,
    gene: gene,
    patient: patient,
    patient_SV: patient_SV,
  };
}
