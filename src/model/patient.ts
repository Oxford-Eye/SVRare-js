import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Patient_HPO, Patient_HPOId } from './Patient_HPO';
import type { Patient_SV, Patient_SVId } from './Patient_SV';

export interface PatientAttributes {
  id: number;
  name?: string;
  family_id?: string;
  manta_path?: string;
  canvas_path?: string;
  bam_path?: string;
  is_solved?: boolean;
  disease?: string;
  is_proband?: boolean;
  relation_to_proband?: string;
}

export type PatientPk = "id";
export type PatientId = Patient[PatientPk];
export type PatientOptionalAttributes = "name" | "family_id" | "manta_path" | "canvas_path" | "bam_path" | "is_solved" | "disease" | "is_proband" | "relation_to_proband";
export type PatientCreationAttributes = Optional<PatientAttributes, PatientOptionalAttributes>;

export class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  id!: number;
  name?: string;
  family_id?: string;
  manta_path?: string;
  canvas_path?: string;
  bam_path?: string;
  is_solved?: boolean;
  disease?: string;
  is_proband?: boolean;
  relation_to_proband?: string;

  // Patient hasMany Patient_HPO via patient_id
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
  // Patient hasMany Patient_SV via patient_id
  Patient_SVs!: Patient_SV[];
  getPatient_SVs!: Sequelize.HasManyGetAssociationsMixin<Patient_SV>;
  setPatient_SVs!: Sequelize.HasManySetAssociationsMixin<Patient_SV, Patient_SVId>;
  addPatient_SV!: Sequelize.HasManyAddAssociationMixin<Patient_SV, Patient_SVId>;
  addPatient_SVs!: Sequelize.HasManyAddAssociationsMixin<Patient_SV, Patient_SVId>;
  createPatient_SV!: Sequelize.HasManyCreateAssociationMixin<Patient_SV>;
  removePatient_SV!: Sequelize.HasManyRemoveAssociationMixin<Patient_SV, Patient_SVId>;
  removePatient_SVs!: Sequelize.HasManyRemoveAssociationsMixin<Patient_SV, Patient_SVId>;
  hasPatient_SV!: Sequelize.HasManyHasAssociationMixin<Patient_SV, Patient_SVId>;
  hasPatient_SVs!: Sequelize.HasManyHasAssociationsMixin<Patient_SV, Patient_SVId>;
  countPatient_SVs!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Patient {
    return Patient.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    family_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    manta_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    canvas_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bam_path: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_solved: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    disease: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_proband: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    relation_to_proband: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Patient',
    timestamps: false,
    indexes: [
      {
        name: "ix_Patient_name",
        unique: true,
        fields: [
          { name: "name" },
        ]
      },
      {
        name: "ix_Patient_family_id",
        fields: [
          { name: "family_id" },
        ]
      },
    ]
  });
  }
}
