import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { SV, SVId } from './SV';
import type { gene, geneId } from './gene';

export interface SV_exonAttributes {
  id: number;
  sv_id: number;
  gene_id: number;
}

export type SV_exonPk = "id";
export type SV_exonId = SV_exon[SV_exonPk];
export type SV_exonCreationAttributes = SV_exonAttributes;

export class SV_exon extends Model<SV_exonAttributes, SV_exonCreationAttributes> implements SV_exonAttributes {
  id!: number;
  sv_id!: number;
  gene_id!: number;

  // SV_exon belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;
  // SV_exon belongsTo gene via gene_id
  gene!: gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<gene, geneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<gene>;

  static initModel(sequelize: Sequelize.Sequelize): typeof SV_exon {
    return SV_exon.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sv_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SV',
        key: 'id'
      }
    },
    gene_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gene',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'SV_exon',
    timestamps: false
  });
  }
}
