import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { SV, SVId } from './SV';
import type { gene, geneId } from './gene';

export interface SV_geneAttributes {
  id: number;
  sv_id: number;
  gene_id: number;
}

export type SV_genePk = "id";
export type SV_geneId = SV_gene[SV_genePk];
export type SV_geneCreationAttributes = SV_geneAttributes;

export class SV_gene extends Model<SV_geneAttributes, SV_geneCreationAttributes> implements SV_geneAttributes {
  id!: number;
  sv_id!: number;
  gene_id!: number;

  // SV_gene belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;
  // SV_gene belongsTo gene via gene_id
  gene!: gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<gene, geneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<gene>;

  static initModel(sequelize: Sequelize.Sequelize): typeof SV_gene {
    return SV_gene.init({
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
    tableName: 'SV_gene',
    timestamps: false
  });
  }
}
