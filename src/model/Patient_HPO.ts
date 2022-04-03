import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { HPO, HPOId } from './HPO';
import type { patient, patientId } from './patient';

export interface Patient_HPOAttributes {
  id: number;
  hpo_id: number;
  patient_id: number;
}

export type Patient_HPOPk = "id";
export type Patient_HPOId = Patient_HPO[Patient_HPOPk];
export type Patient_HPOCreationAttributes = Patient_HPOAttributes;

export class Patient_HPO extends Model<Patient_HPOAttributes, Patient_HPOCreationAttributes> implements Patient_HPOAttributes {
  id!: number;
  hpo_id!: number;
  patient_id!: number;

  // Patient_HPO belongsTo HPO via hpo_id
  hpo!: HPO;
  getHpo!: Sequelize.BelongsToGetAssociationMixin<HPO>;
  setHpo!: Sequelize.BelongsToSetAssociationMixin<HPO, HPOId>;
  createHpo!: Sequelize.BelongsToCreateAssociationMixin<HPO>;
  // Patient_HPO belongsTo patient via patient_id
  patient!: patient;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patient>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patient, patientId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<patient>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Patient_HPO {
    return Patient_HPO.init({
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
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patient',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Patient_HPO',
    timestamps: false
  });
  }
}
