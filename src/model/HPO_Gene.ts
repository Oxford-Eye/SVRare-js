import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Gene, GeneId } from './Gene';
import type { HPO, HPOId } from './HPO';

export interface HPO_GeneAttributes {
  id: number;
  hpo_id: number;
  gene_id: number;
}

export type HPO_GenePk = "id";
export type HPO_GeneId = HPO_Gene[HPO_GenePk];
export type HPO_GeneCreationAttributes = HPO_GeneAttributes;

export class HPO_Gene extends Model<HPO_GeneAttributes, HPO_GeneCreationAttributes> implements HPO_GeneAttributes {
  id!: number;
  hpo_id!: number;
  gene_id!: number;

  // HPO_Gene belongsTo Gene via gene_id
  gene!: Gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<Gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<Gene, GeneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<Gene>;
  // HPO_Gene belongsTo HPO via hpo_id
  hpo!: HPO;
  getHpo!: Sequelize.BelongsToGetAssociationMixin<HPO>;
  setHpo!: Sequelize.BelongsToSetAssociationMixin<HPO, HPOId>;
  createHpo!: Sequelize.BelongsToCreateAssociationMixin<HPO>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HPO_Gene {
    return HPO_Gene.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hpo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HPO',
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
    tableName: 'HPO_Gene',
    timestamps: false
  });
  }
}
