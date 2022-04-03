import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { SV, SVId } from './SV';
import type { patient, patientId } from './patient';

export interface patient_SVAttributes {
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

export type patient_SVPk = "id";
export type patient_SVId = patient_SV[patient_SVPk];
export type patient_SVOptionalAttributes = "filter" | "is_duplicate" | "igv_real" | "validated_as_real";
export type patient_SVCreationAttributes = Optional<patient_SVAttributes, patient_SVOptionalAttributes>;

export class patient_SV extends Model<patient_SVAttributes, patient_SVCreationAttributes> implements patient_SVAttributes {
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

  // patient_SV belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;
  // patient_SV belongsTo patient via patient_id
  patient!: patient;
  getPatient!: Sequelize.BelongsToGetAssociationMixin<patient>;
  setPatient!: Sequelize.BelongsToSetAssociationMixin<patient, patientId>;
  createPatient!: Sequelize.BelongsToCreateAssociationMixin<patient>;

  static initModel(sequelize: Sequelize.Sequelize): typeof patient_SV {
    return patient_SV.init({
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
        model: 'patient',
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
    tableName: 'patient_SV',
    timestamps: false,
    indexes: [
      {
        name: "ix_patient_SV_validated_as_real",
        fields: [
          { name: "validated_as_real" },
        ]
      },
      {
        name: "ix_patient_SV_igv_real",
        fields: [
          { name: "igv_real" },
        ]
      },
      {
        name: "ix_patient_SV_filter",
        fields: [
          { name: "filter" },
        ]
      },
    ]
  });
  }
}
