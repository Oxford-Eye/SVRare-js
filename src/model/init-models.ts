import type { Sequelize } from "sequelize";
import { Gene as _Gene } from "./Gene";
import type { GeneAttributes, GeneCreationAttributes } from "./Gene";
import { HPO as _HPO } from "./HPO";
import type { HPOAttributes, HPOCreationAttributes } from "./HPO";
import { HPO_Gene as _HPO_Gene } from "./HPO_Gene";
import type { HPO_GeneAttributes, HPO_GeneCreationAttributes } from "./HPO_Gene";
import { HPO_HPO as _HPO_HPO } from "./HPO_HPO";
import type { HPO_HPOAttributes, HPO_HPOCreationAttributes } from "./HPO_HPO";
import { Patient as _Patient } from "./Patient";
import type { PatientAttributes, PatientCreationAttributes } from "./Patient";
import { Patient_HPO as _Patient_HPO } from "./Patient_HPO";
import type { Patient_HPOAttributes, Patient_HPOCreationAttributes } from "./Patient_HPO";
import { Patient_SV as _Patient_SV } from "./Patient_SV";
import type { Patient_SVAttributes, Patient_SVCreationAttributes } from "./Patient_SV";
import { SV as _SV } from "./SV";
import type { SVAttributes, SVCreationAttributes } from "./SV";
import { SV_Gene as _SV_Gene } from "./SV_Gene";
import type { SV_GeneAttributes, SV_GeneCreationAttributes } from "./SV_Gene";
import { SV_cds as _SV_cds } from "./SV_cds";
import type { SV_cdsAttributes, SV_cdsCreationAttributes } from "./SV_cds";
import { SV_exon as _SV_exon } from "./SV_exon";
import type { SV_exonAttributes, SV_exonCreationAttributes } from "./SV_exon";

export {
  _Gene as Gene,
  _HPO as HPO,
  _HPO_Gene as HPO_Gene,
  _HPO_HPO as HPO_HPO,
  _Patient as Patient,
  _Patient_HPO as Patient_HPO,
  _Patient_SV as Patient_SV,
  _SV as SV,
  _SV_Gene as SV_Gene,
  _SV_cds as SV_cds,
  _SV_exon as SV_exon,
};

export type {
  GeneAttributes,
  GeneCreationAttributes,
  HPOAttributes,
  HPOCreationAttributes,
  HPO_GeneAttributes,
  HPO_GeneCreationAttributes,
  HPO_HPOAttributes,
  HPO_HPOCreationAttributes,
  PatientAttributes,
  PatientCreationAttributes,
  Patient_HPOAttributes,
  Patient_HPOCreationAttributes,
  Patient_SVAttributes,
  Patient_SVCreationAttributes,
  SVAttributes,
  SVCreationAttributes,
  SV_GeneAttributes,
  SV_GeneCreationAttributes,
  SV_cdsAttributes,
  SV_cdsCreationAttributes,
  SV_exonAttributes,
  SV_exonCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Gene = _Gene.initModel(sequelize);
  const HPO = _HPO.initModel(sequelize);
  const HPO_Gene = _HPO_Gene.initModel(sequelize);
  const HPO_HPO = _HPO_HPO.initModel(sequelize);
  const Patient = _Patient.initModel(sequelize);
  const Patient_HPO = _Patient_HPO.initModel(sequelize);
  const Patient_SV = _Patient_SV.initModel(sequelize);
  const SV = _SV.initModel(sequelize);
  const SV_Gene = _SV_Gene.initModel(sequelize);
  const SV_cds = _SV_cds.initModel(sequelize);
  const SV_exon = _SV_exon.initModel(sequelize);

  HPO_Gene.belongsTo(Gene, { as: "gene", foreignKey: "gene_id"});
  Gene.hasMany(HPO_Gene, { as: "HPO_Genes", foreignKey: "gene_id"});
  SV_Gene.belongsTo(Gene, { as: "gene", foreignKey: "gene_id"});
  Gene.hasMany(SV_Gene, { as: "SV_Genes", foreignKey: "gene_id"});
  SV_cds.belongsTo(Gene, { as: "gene", foreignKey: "gene_id"});
  Gene.hasMany(SV_cds, { as: "SV_cds", foreignKey: "gene_id"});
  SV_exon.belongsTo(Gene, { as: "gene", foreignKey: "gene_id"});
  Gene.hasMany(SV_exon, { as: "SV_exons", foreignKey: "gene_id"});
  HPO_Gene.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(HPO_Gene, { as: "HPO_Genes", foreignKey: "hpo_id"});
  HPO_HPO.belongsTo(HPO, { as: "parent_hpo", foreignKey: "parent_hpo_id"});
  HPO.hasMany(HPO_HPO, { as: "HPO_HPOs", foreignKey: "parent_hpo_id"});
  HPO_HPO.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(HPO_HPO, { as: "hpo_HPO_HPOs", foreignKey: "hpo_id"});
  Patient_HPO.belongsTo(HPO, { as: "hpo", foreignKey: "hpo_id"});
  HPO.hasMany(Patient_HPO, { as: "Patient_HPOs", foreignKey: "hpo_id"});
  Patient_HPO.belongsTo(Patient, { as: "patient", foreignKey: "patient_id"});
  Patient.hasMany(Patient_HPO, { as: "Patient_HPOs", foreignKey: "patient_id"});
  Patient_SV.belongsTo(Patient, { as: "patient", foreignKey: "patient_id"});
  Patient.hasMany(Patient_SV, { as: "Patient_SVs", foreignKey: "patient_id"});
  Patient_SV.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(Patient_SV, { as: "Patient_SVs", foreignKey: "sv_id"});
  SV_Gene.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_Gene, { as: "SV_Genes", foreignKey: "sv_id"});
  SV_cds.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_cds, { as: "SV_cds", foreignKey: "sv_id"});
  SV_exon.belongsTo(SV, { as: "sv", foreignKey: "sv_id"});
  SV.hasMany(SV_exon, { as: "SV_exons", foreignKey: "sv_id"});

  return {
    Gene: Gene,
    HPO: HPO,
    HPO_Gene: HPO_Gene,
    HPO_HPO: HPO_HPO,
    Patient: Patient,
    Patient_HPO: Patient_HPO,
    Patient_SV: Patient_SV,
    SV: SV,
    SV_Gene: SV_Gene,
    SV_cds: SV_cds,
    SV_exon: SV_exon,
  };
}
