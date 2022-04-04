import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Gene, GeneId } from './Gene';
import type { SV, SVId } from './SV';

export interface SV_GeneAttributes {
  id: number;
  sv_id: number;
  gene_id: number;
}

export type SV_GenePk = "id";
export type SV_GeneId = SV_Gene[SV_GenePk];
export type SV_GeneCreationAttributes = SV_GeneAttributes;

export class SV_Gene extends Model<SV_GeneAttributes, SV_GeneCreationAttributes> implements SV_GeneAttributes {
  id!: number;
  sv_id!: number;
  gene_id!: number;

  // SV_Gene belongsTo Gene via gene_id
  gene!: Gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<Gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<Gene, GeneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<Gene>;
  // SV_Gene belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;

  static initModel(sequelize: Sequelize.Sequelize): typeof SV_Gene {
    return SV_Gene.init({
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
        model: 'Gene',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'SV_Gene',
    timestamps: false
  });
  }
}
