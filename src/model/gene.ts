import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO_gene, HPO_geneId } from './HPO_gene';
import type { SV_cds, SV_cdsId } from './SV_cds';
import type { SV_exon, SV_exonId } from './SV_exon';
import type { SV_gene, SV_geneId } from './SV_gene';

export interface geneAttributes {
  id: number;
  symbol?: string;
  chrom: string;
  start?: number;
  end?: number;
}

export type genePk = "id";
export type geneId = gene[genePk];
export type geneOptionalAttributes = "symbol" | "start" | "end";
export type geneCreationAttributes = Optional<geneAttributes, geneOptionalAttributes>;

export class gene extends Model<geneAttributes, geneCreationAttributes> implements geneAttributes {
  id!: number;
  symbol?: string;
  chrom!: string;
  start?: number;
  end?: number;

  // gene hasMany HPO_gene via gene_id
  HPO_genes!: HPO_gene[];
  getHPO_genes!: Sequelize.HasManyGetAssociationsMixin<HPO_gene>;
  setHPO_genes!: Sequelize.HasManySetAssociationsMixin<HPO_gene, HPO_geneId>;
  addHPO_gene!: Sequelize.HasManyAddAssociationMixin<HPO_gene, HPO_geneId>;
  addHPO_genes!: Sequelize.HasManyAddAssociationsMixin<HPO_gene, HPO_geneId>;
  createHPO_gene!: Sequelize.HasManyCreateAssociationMixin<HPO_gene>;
  removeHPO_gene!: Sequelize.HasManyRemoveAssociationMixin<HPO_gene, HPO_geneId>;
  removeHPO_genes!: Sequelize.HasManyRemoveAssociationsMixin<HPO_gene, HPO_geneId>;
  hasHPO_gene!: Sequelize.HasManyHasAssociationMixin<HPO_gene, HPO_geneId>;
  hasHPO_genes!: Sequelize.HasManyHasAssociationsMixin<HPO_gene, HPO_geneId>;
  countHPO_genes!: Sequelize.HasManyCountAssociationsMixin;
  // gene hasMany SV_cds via gene_id
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
  // gene hasMany SV_exon via gene_id
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
  // gene hasMany SV_gene via gene_id
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

  static initModel(sequelize: Sequelize.Sequelize): typeof gene {
    return gene.init({
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
    tableName: 'gene',
    timestamps: false,
    indexes: [
      {
        name: "ix_gene_start",
        fields: [
          { name: "start" },
        ]
      },
      {
        name: "ix_gene_end",
        fields: [
          { name: "end" },
        ]
      },
      {
        name: "ix_gene_symbol",
        fields: [
          { name: "symbol" },
        ]
      },
    ]
  });
  }
}
