import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { SV, SVId } from './SV';
import type { gene, geneId } from './gene';

export interface SV_cdsAttributes {
  id: number;
  sv_id: number;
  gene_id: number;
}

export type SV_cdsPk = "id";
export type SV_cdsId = SV_cds[SV_cdsPk];
export type SV_cdsCreationAttributes = SV_cdsAttributes;

export class SV_cds extends Model<SV_cdsAttributes, SV_cdsCreationAttributes> implements SV_cdsAttributes {
  id!: number;
  sv_id!: number;
  gene_id!: number;

  // SV_cds belongsTo SV via sv_id
  sv!: SV;
  getSv!: Sequelize.BelongsToGetAssociationMixin<SV>;
  setSv!: Sequelize.BelongsToSetAssociationMixin<SV, SVId>;
  createSv!: Sequelize.BelongsToCreateAssociationMixin<SV>;
  // SV_cds belongsTo gene via gene_id
  gene!: gene;
  getGene!: Sequelize.BelongsToGetAssociationMixin<gene>;
  setGene!: Sequelize.BelongsToSetAssociationMixin<gene, geneId>;
  createGene!: Sequelize.BelongsToCreateAssociationMixin<gene>;

  static initModel(sequelize: Sequelize.Sequelize): typeof SV_cds {
    return SV_cds.init({
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
    tableName: 'SV_cds',
    timestamps: false
  });
  }
}
