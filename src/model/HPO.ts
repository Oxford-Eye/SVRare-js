import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO_Gene, HPO_GeneId } from './HPO_Gene';
import type { HPO_HPO, HPO_HPOId } from './HPO_HPO';
import type { Patient_HPO, Patient_HPOId } from './Patient_HPO';

export interface HPOAttributes {
  id: number;
  name?: string;
  definition?: string;
  comment?: string;
}

export type HPOPk = "id";
export type HPOId = HPO[HPOPk];
export type HPOOptionalAttributes = "name" | "definition" | "comment";
export type HPOCreationAttributes = Optional<HPOAttributes, HPOOptionalAttributes>;

export class HPO extends Model<HPOAttributes, HPOCreationAttributes> implements HPOAttributes {
  id!: number;
  name?: string;
  definition?: string;
  comment?: string;

  // HPO hasMany HPO_Gene via hpo_id
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
  // HPO hasMany HPO_HPO via parent_hpo_id
  HPO_HPOs!: HPO_HPO[];
  getHPO_HPOs!: Sequelize.HasManyGetAssociationsMixin<HPO_HPO>;
  setHPO_HPOs!: Sequelize.HasManySetAssociationsMixin<HPO_HPO, HPO_HPOId>;
  addHPO_HPO!: Sequelize.HasManyAddAssociationMixin<HPO_HPO, HPO_HPOId>;
  addHPO_HPOs!: Sequelize.HasManyAddAssociationsMixin<HPO_HPO, HPO_HPOId>;
  createHPO_HPO!: Sequelize.HasManyCreateAssociationMixin<HPO_HPO>;
  removeHPO_HPO!: Sequelize.HasManyRemoveAssociationMixin<HPO_HPO, HPO_HPOId>;
  removeHPO_HPOs!: Sequelize.HasManyRemoveAssociationsMixin<HPO_HPO, HPO_HPOId>;
  hasHPO_HPO!: Sequelize.HasManyHasAssociationMixin<HPO_HPO, HPO_HPOId>;
  hasHPO_HPOs!: Sequelize.HasManyHasAssociationsMixin<HPO_HPO, HPO_HPOId>;
  countHPO_HPOs!: Sequelize.HasManyCountAssociationsMixin;
  // HPO hasMany HPO_HPO via hpo_id
  hpo_HPO_HPOs!: HPO_HPO[];
  getHpo_HPO_HPOs!: Sequelize.HasManyGetAssociationsMixin<HPO_HPO>;
  setHpo_HPO_HPOs!: Sequelize.HasManySetAssociationsMixin<HPO_HPO, HPO_HPOId>;
  addHpo_HPO_HPO!: Sequelize.HasManyAddAssociationMixin<HPO_HPO, HPO_HPOId>;
  addHpo_HPO_HPOs!: Sequelize.HasManyAddAssociationsMixin<HPO_HPO, HPO_HPOId>;
  createHpo_HPO_HPO!: Sequelize.HasManyCreateAssociationMixin<HPO_HPO>;
  removeHpo_HPO_HPO!: Sequelize.HasManyRemoveAssociationMixin<HPO_HPO, HPO_HPOId>;
  removeHpo_HPO_HPOs!: Sequelize.HasManyRemoveAssociationsMixin<HPO_HPO, HPO_HPOId>;
  hasHpo_HPO_HPO!: Sequelize.HasManyHasAssociationMixin<HPO_HPO, HPO_HPOId>;
  hasHpo_HPO_HPOs!: Sequelize.HasManyHasAssociationsMixin<HPO_HPO, HPO_HPOId>;
  countHpo_HPO_HPOs!: Sequelize.HasManyCountAssociationsMixin;
  // HPO hasMany Patient_HPO via hpo_id
  Patient_HPOs!: Patient_HPO[];
  getPatient_HPOs!: Sequelize.HasManyGetAssociationsMixin<Patient_HPO>;
  setPatient_HPOs!: Sequelize.HasManySetAssociationsMixin<Patient_HPO, Patient_HPOId>;
  addPatient_HPO!: Sequelize.HasManyAddAssociationMixin<Patient_HPO, Patient_HPOId>;
  addPatient_HPOs!: Sequelize.HasManyAddAssociationsMixin<Patient_HPO, Patient_HPOId>;
  createPatient_HPO!: Sequelize.HasManyCreateAssociationMixin<Patient_HPO>;
  removePatient_HPO!: Sequelize.HasManyRemoveAssociationMixin<Patient_HPO, Patient_HPOId>;
  removePatient_HPOs!: Sequelize.HasManyRemoveAssociationsMixin<Patient_HPO, Patient_HPOId>;
  hasPatient_HPO!: Sequelize.HasManyHasAssociationMixin<Patient_HPO, Patient_HPOId>;
  hasPatient_HPOs!: Sequelize.HasManyHasAssociationsMixin<Patient_HPO, Patient_HPOId>;
  countPatient_HPOs!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof HPO {
    return HPO.init({
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
    definition: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'HPO',
    timestamps: false,
    indexes: [
      {
        name: "ix_HPO_name",
        fields: [
          { name: "name" },
        ]
      },
    ]
  });
  }
}
