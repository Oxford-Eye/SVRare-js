import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { SV_cds, SV_cdsId } from './SV_cds';
import type { SV_exon, SV_exonId } from './SV_exon';
import type { SV_gene, SV_geneId } from './SV_gene';
import type { patient_SV, patient_SVId } from './patient_SV';

export interface SVAttributes {
  id: number;
  name?: string;
  chrom?: string;
  start?: number;
  end?: number;
  sv_type?: string;
  gnomad_freq?: number;
  dbvar_count?: number;
  decipher_freq?: number;
}

export type SVPk = "id";
export type SVId = SV[SVPk];
export type SVOptionalAttributes = "name" | "chrom" | "start" | "end" | "sv_type" | "gnomad_freq" | "dbvar_count" | "decipher_freq";
export type SVCreationAttributes = Optional<SVAttributes, SVOptionalAttributes>;

export class SV extends Model<SVAttributes, SVCreationAttributes> implements SVAttributes {
  id!: number;
  name?: string;
  chrom?: string;
  start?: number;
  end?: number;
  sv_type?: string;
  gnomad_freq?: number;
  dbvar_count?: number;
  decipher_freq?: number;

  // SV hasMany SV_cds via sv_id
  SV_cds!: SV_cds[];
  getSV_cds!: Sequelize.HasManyGetAssociationsMixin<SV_cds>;
  setSV_cds!: Sequelize.HasManySetAssociationsMixin<SV_cds, SV_cdsId>;
  addSV_cd!: Sequelize.HasManyAddAssociationMixin<SV_cds, SV_cdsId>;
  addSV_cds!: Sequelize.HasManyAddAssociationsMixin<SV_cds, SV_cdsId>;
  createSV_cd!: Sequelize.HasManyCreateAssociationMixin<SV_cds>;
  removeSV_cd!: Sequelize.HasManyRemoveAssociationMixin<SV_cds, SV_cdsId>;
  removeSV_cds!: Sequelize.HasManyRemoveAssociationsMixin<SV_cds, SV_cdsId>;
  hasSV_cd!: Sequelize.HasManyHasAssociationMixin<SV_cds, SV_cdsId>;
  hasSV_cds!: Sequelize.HasManyHasAssociationsMixin<SV_cds, SV_cdsId>;
  countSV_cds!: Sequelize.HasManyCountAssociationsMixin;
  // SV hasMany SV_exon via sv_id
  SV_exons!: SV_exon[];
  getSV_exons!: Sequelize.HasManyGetAssociationsMixin<SV_exon>;
  setSV_exons!: Sequelize.HasManySetAssociationsMixin<SV_exon, SV_exonId>;
  addSV_exon!: Sequelize.HasManyAddAssociationMixin<SV_exon, SV_exonId>;
  addSV_exons!: Sequelize.HasManyAddAssociationsMixin<SV_exon, SV_exonId>;
  createSV_exon!: Sequelize.HasManyCreateAssociationMixin<SV_exon>;
  removeSV_exon!: Sequelize.HasManyRemoveAssociationMixin<SV_exon, SV_exonId>;
  removeSV_exons!: Sequelize.HasManyRemoveAssociationsMixin<SV_exon, SV_exonId>;
  hasSV_exon!: Sequelize.HasManyHasAssociationMixin<SV_exon, SV_exonId>;
  hasSV_exons!: Sequelize.HasManyHasAssociationsMixin<SV_exon, SV_exonId>;
  countSV_exons!: Sequelize.HasManyCountAssociationsMixin;
  // SV hasMany SV_gene via sv_id
  SV_genes!: SV_gene[];
  getSV_genes!: Sequelize.HasManyGetAssociationsMixin<SV_gene>;
  setSV_genes!: Sequelize.HasManySetAssociationsMixin<SV_gene, SV_geneId>;
  addSV_gene!: Sequelize.HasManyAddAssociationMixin<SV_gene, SV_geneId>;
  addSV_genes!: Sequelize.HasManyAddAssociationsMixin<SV_gene, SV_geneId>;
  createSV_gene!: Sequelize.HasManyCreateAssociationMixin<SV_gene>;
  removeSV_gene!: Sequelize.HasManyRemoveAssociationMixin<SV_gene, SV_geneId>;
  removeSV_genes!: Sequelize.HasManyRemoveAssociationsMixin<SV_gene, SV_geneId>;
  hasSV_gene!: Sequelize.HasManyHasAssociationMixin<SV_gene, SV_geneId>;
  hasSV_genes!: Sequelize.HasManyHasAssociationsMixin<SV_gene, SV_geneId>;
  countSV_genes!: Sequelize.HasManyCountAssociationsMixin;
  // SV hasMany patient_SV via sv_id
  patient_SVs!: patient_SV[];
  getPatient_SVs!: Sequelize.HasManyGetAssociationsMixin<patient_SV>;
  setPatient_SVs!: Sequelize.HasManySetAssociationsMixin<patient_SV, patient_SVId>;
  addPatient_SV!: Sequelize.HasManyAddAssociationMixin<patient_SV, patient_SVId>;
  addPatient_SVs!: Sequelize.HasManyAddAssociationsMixin<patient_SV, patient_SVId>;
  createPatient_SV!: Sequelize.HasManyCreateAssociationMixin<patient_SV>;
  removePatient_SV!: Sequelize.HasManyRemoveAssociationMixin<patient_SV, patient_SVId>;
  removePatient_SVs!: Sequelize.HasManyRemoveAssociationsMixin<patient_SV, patient_SVId>;
  hasPatient_SV!: Sequelize.HasManyHasAssociationMixin<patient_SV, patient_SVId>;
  hasPatient_SVs!: Sequelize.HasManyHasAssociationsMixin<patient_SV, patient_SVId>;
  countPatient_SVs!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof SV {
    return SV.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    chrom: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    end: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sv_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gnomad_freq: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    dbvar_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    decipher_freq: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'SV',
    timestamps: false,
    indexes: [
      {
        name: "ix_SV_start",
        fields: [
          { name: "start" },
        ]
      },
      {
        name: "ix_SV_decipher_freq",
        fields: [
          { name: "decipher_freq" },
        ]
      },
      {
        name: "ix_SV_chrom",
        fields: [
          { name: "chrom" },
        ]
      },
      {
        name: "ix_SV_sv_type",
        fields: [
          { name: "sv_type" },
        ]
      },
      {
        name: "ix_SV_name",
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "ix_SV_end",
        fields: [
          { name: "end" },
        ]
      },
      {
        name: "ix_SV_dbvar_count",
        fields: [
          { name: "dbvar_count" },
        ]
      },
      {
        name: "ix_SV_gnomad_freq",
        fields: [
          { name: "gnomad_freq" },
        ]
      },
    ]
  });
  }
}
