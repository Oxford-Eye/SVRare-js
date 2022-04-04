import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { Patient, PatientId } from './Patient';
import type { SV, SVId } from './SV';

export interface Patient_SVAttributes {
  id: number;
  patient_id: number;
  sv_id: number;
  genotype: string;
  vcf_id: string;
  source: string;
  filter?: string;
  is_duplicate?: boolean;
  igv_real?: boolean;
  validated_as_real?: boolean;
}

export type Patient_SVPk = "id";
export type Patient_SVId = Patient_SV[Patient_SVPk];
export type Patient_SVOptionalAttributes = "filter" | "is_duplicate" | "igv_real" | "validated_as_real";
export type Patient_SVCreationAttributes = Optional<Patient_SVAttributes, Patient_SVOptionalAttributes>;

export class Patient_SV extends Model<Patient_SVAttributes, Patient_SVCreationAttributes> implements Patient_SVAttributes {
  id!: number;
  patient_id!: number;
  sv_id!: number;
  genotype!: string;
  vcf_id!: string;
  source!: string;
  filter?: string;
  is_duplicate?: boolean;
  igv_real?: boolean;
  validated_as_real?: boolean;

  // Patient_SV belongsTo Patient via patient_id
  patient!: Patient;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<Patient>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<Patient, PatientId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<Patient>;
  // Patient_SV belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Patient_SV {
    return Patient_SV.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patient',
        key: 'id'
      }
    },
    sv_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SV',
        key: 'id'
      }
    },
    genotype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vcf_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_duplicate: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    igv_real: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    validated_as_real: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Patient_SV',
    timestamps: false,
    indexes: [
      {
        name: "ix_Patient_SV_validated_as_real",
        fields: [
          { name: "validated_as_real" },
        ]
      },
      {
        name: "ix_Patient_SV_filter",
        fields: [
          { name: "filter" },
        ]
      },
      {
        name: "ix_Patient_SV_igv_real",
        fields: [
          { name: "igv_real" },
        ]
      },
    ]
  });
  }
}
