import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO, HPOId } from './HPO';

export interface HPO_HPOAttributes {
  id: number;
  hpo_id: number;
  parent_hpo_id: number;
}

export type HPO_HPOPk = "id";
export type HPO_HPOId = HPO_HPO[HPO_HPOPk];
export type HPO_HPOCreationAttributes = HPO_HPOAttributes;

export class HPO_HPO extends Model<HPO_HPOAttributes, HPO_HPOCreationAttributes> implements HPO_HPOAttributes {
  id!: number;
  hpo_id!: number;
  parent_hpo_id!: number;

  // HPO_HPO belongsTo HPO via parent_hpo_id
  parent_hpo!: HPO;
  getParent_hpo!: Sequelize.BelongsToGetAssociationMixin<HPO>;
  setParent_hpo!: Sequelize.BelongsToSetAssociationMixin<HPO, HPOId>;
  createParent_hpo!: Sequelize.BelongsToCreateAssociationMixin<HPO>;
  // HPO_HPO belongsTo HPO via hpo_id
  hpo!: HPO;
  getHpo!: Sequelize.BelongsToGetAssociationMixin<HPO>;
  setHpo!: Sequelize.BelongsToSetAssociationMixin<HPO, HPOId>;
  createHpo!: Sequelize.BelongsToCreateAssociationMixin<HPO>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HPO_HPO {
    return HPO_HPO.init({
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
    parent_hpo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'HPO',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'HPO_HPO',
    timestamps: false
  });
  }
}
