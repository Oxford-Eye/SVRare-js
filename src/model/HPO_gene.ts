import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO, HPOId } from './HPO';
import type { gene, geneId } from './gene';

export interface HPO_geneAttributes {
  id: number;
  hpo_id: number;
  gene_id: number;
}

export type HPO_genePk = "id";
export type HPO_geneId = HPO_gene[HPO_genePk];
export type HPO_geneCreationAttributes = HPO_geneAttributes;

export class HPO_gene extends Model<HPO_geneAttributes, HPO_geneCreationAttributes> implements HPO_geneAttributes {
  id!: number;
  hpo_id!: number;
  gene_id!: number;

  // HPO_gene belongsTo HPO via hpo_id
  hpo!: HPO;
  getHpo!: Sequelize.BelongsToGetAssociationMixin<HPO>;
  setHpo!: Sequelize.BelongsToSetAssociationMixin<HPO, HPOId>;
  createHpo!: Sequelize.BelongsToCreateAssociationMixin<HPO>;
  // HPO_gene belongsTo gene via gene_id
  gene!: gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<gene, geneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<gene>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HPO_gene {
    return HPO_gene.init({
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
        model: 'gene',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'HPO_gene',
    timestamps: false
  });
  }
}
