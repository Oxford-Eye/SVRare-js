import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO_Gene, HPO_GeneId } from './HPO_Gene';
import type { SV_Gene, SV_GeneId } from './SV_Gene';
import type { SV_cds, SV_cdsId } from './SV_cds';
import type { SV_exon, SV_exonId } from './SV_exon';

export interface GeneAttributes {
  id: number;
  symbol?: string;
  chrom: string;
  prec?: number;
  pli?: number;
  oe_lof_upper?: number;
  start?: number;
  end?: number;
}

export type GenePk = "id";
export type GeneId = Gene[GenePk];
export type GeneOptionalAttributes = "symbol" | "start" | "pli" | "prec" | "oe_lof_upper" | "end";
export type GeneCreationAttributes = Optional<GeneAttributes, GeneOptionalAttributes>;

export class Gene extends Model<GeneAttributes, GeneCreationAttributes> implements GeneAttributes {
  id!: number;
  symbol?: string;
  chrom!: string;
  prec?: number;
  pli?: number;
  oe_lof_upper?: number;
  start?: number;
  end?: number;

  // Gene hasMany HPO_Gene via gene_id
  HPO_Genes!: HPO_Gene[];
  getHPO_Genes!: Sequelize.HasManyGetAssociationsMixin<HPO_Gene>;
  setHPO_Genes!: Sequelize.HasManySetAssociationsMixin<HPO_Gene, HPO_GeneId>;
  addHPO_Gene!: Sequelize.HasManyAddAssociationMixin<HPO_Gene, HPO_GeneId>;
  addHPO_Genes!: Sequelize.HasManyAddAssociationsMixin<HPO_Gene, HPO_GeneId>;
  createHPO_Gene!: Sequelize.HasManyCreateAssociationMixin<HPO_Gene>;
  removeHPO_Gene!: Sequelize.HasManyRemoveAssociationMixin<HPO_Gene, HPO_GeneId>;
  removeHPO_Genes!: Sequelize.HasManyRemoveAssociationsMixin<HPO_Gene, HPO_GeneId>;
  hasHPO_Gene!: Sequelize.HasManyHasAssociationMixin<HPO_Gene, HPO_GeneId>;
  hasHPO_Genes!: Sequelize.HasManyHasAssociationsMixin<HPO_Gene, HPO_GeneId>;
  countHPO_Genes!: Sequelize.HasManyCountAssociationsMixin;
  // Gene hasMany SV_Gene via gene_id
  SV_Genes!: SV_Gene[];
  getSV_Genes!: Sequelize.HasManyGetAssociationsMixin<SV_Gene>;
  setSV_Genes!: Sequelize.HasManySetAssociationsMixin<SV_Gene, SV_GeneId>;
  addSV_Gene!: Sequelize.HasManyAddAssociationMixin<SV_Gene, SV_GeneId>;
  addSV_Genes!: Sequelize.HasManyAddAssociationsMixin<SV_Gene, SV_GeneId>;
  createSV_Gene!: Sequelize.HasManyCreateAssociationMixin<SV_Gene>;
  removeSV_Gene!: Sequelize.HasManyRemoveAssociationMixin<SV_Gene, SV_GeneId>;
  removeSV_Genes!: Sequelize.HasManyRemoveAssociationsMixin<SV_Gene, SV_GeneId>;
  hasSV_Gene!: Sequelize.HasManyHasAssociationMixin<SV_Gene, SV_GeneId>;
  hasSV_Genes!: Sequelize.HasManyHasAssociationsMixin<SV_Gene, SV_GeneId>;
  countSV_Genes!: Sequelize.HasManyCountAssociationsMixin;
  // Gene hasMany SV_cds via gene_id
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
  // Gene hasMany SV_exon via gene_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof Gene {
    return Gene.init({
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      symbol: {
        type: DataTypes.STRING,
        allowNull: true
      },
      chrom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prec: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      pli: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      oe_lof_upper: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      start: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      end: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      tableName: 'Gene',
      timestamps: false,
      indexes: [
        {
          name: "ix_Gene_start",
          fields: [
            { name: "start" },
          ]
        },
        {
          name: "ix_Gene_symbol",
          fields: [
            { name: "symbol" },
          ]
        },
        {
          name: "ix_Gene_end",
          fields: [
            { name: "end" },
          ]
        },
      ]
    });
  }
}
