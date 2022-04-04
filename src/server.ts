// sqlite3's node-gyp relies on python2, not compatible with python3. so relies on the un-released-yet commit
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import db from './config/database.config';
import { initModels } from './model/init-models';
import sequelize from 'sequelize';

db.sync().then(() => {
  console.log('connet to db');
})

const models = initModels(db);

const app = express();
const port = 9000;
const corsOptions = {
  origin: "*",
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sess = {
  secret: "awesome ness",
  resave: false,
  saveUninitialized: false
};
app.use(session(sess));

// database table relations
// ? Note that many-to-many is not working as expected. Takes forever in query.
models.SV.hasMany(models.Patient_SV, {
  foreignKey: { name: 'sv_id' }
});
models.Patient_SV.belongsTo(models.SV, {
  foreignKey: { name: 'sv_id' }
});
//models.SV.belongsToMany(models.gene, { through: 'SV_gene', foreignKey: { name: 'sv_id' } });
//models.gene.belongsToMany(models.SV, { through: 'SV_gene', foreignKey: { name: 'gene_id' } });

interface SVGene { 'sv_id': number, 'gene_id': number, 'symbol': string }

const ensemblId2symbol = async (data: any[]): Promise<SVGene[]> => {
  /*
  This function is to convert ensembl id to symbol for a number of models,
  including SV_gene, SV_exon, SV_cds
  TODO: include HPO_gene
  */
  const geneIds = data.map(d => d.gene_id);
  const query = await models.Gene.findAll({
    where: { id: geneIds }
  })
  return data.map(d => {
    const symbol: string = query.find(e => e.id === d.gene_id)?.symbol!;
    return {
      ...d,
      symbol: symbol
    }
  })
}

app.get("/", async (_, res: Response) => {
  // type for the distinct family result
  type Family = { 'DISTINCT': string };

  try {
    const data: Family[] = await models.Patient.aggregate('family_id', 'DISTINCT', { plain: false });
    return res.json({
      status: 500,
      data: data.map((d: Family) => { return { familyId: d.DISTINCT } })
    })
  } catch (error) {
    console.log(error);
  }
});

app.get("/family", async (req: Request, res: Response) => {
  try {
    // TODO: customisable pageSize
    const pageSize = req.query.pageSize as unknown as number;
    const familyId = req.query.familyId as string;
    const page = req.query.page as unknown as number;
    // Firstly find the proband of the family
    const proband = await models.Patient.findOne({
      where: {
        family_id: familyId,
        is_proband: true
      }
    });
    if (proband === null) {
      res.json({
        status: 404,
        error: `family or proband doesn't exist: family_id:${familyId}`
      })
    } else {
      // Patient_SV
      const PS = await models.Patient_SV.findAll({
        where: { patient_id: proband.id },
        raw: true, //raw: true to return simplified data
        include: [{
          model: models.SV,
          required: true
        }],
        order: [
          ['SV', 'gnomad_freq', 'ASC'],
          ['SV', 'dbvar_count', 'ASC'],
        ],
        offset: page * pageSize,
        limit: pageSize
      });
      const SV_ids = PS.map(ps => ps.sv_id);
      // SV_gene
      const SV_genes = await models.SV_Gene.findAll({
        raw: true,
        where: { sv_id: SV_ids }
      });
      const SV_genes_with_symbol = await ensemblId2symbol(SV_genes);
      // SV_cds
      const SV_cds = await models.SV_cds.findAll({
        raw: true,
        where: { sv_id: SV_ids }
      });
      const SV_cds_with_symbol = await ensemblId2symbol(SV_cds);
      // SV_exon
      const SV_exon = await models.SV_exon.findAll({
        raw: true,
        where: { sv_id: SV_ids }
      });
      const SV_exon_with_symbol = await ensemblId2symbol(SV_exon);

      // merge
      const findSymbols = (data: SVGene[], sv_id: number): (string | undefined)[] => {
        const thisSVgenes = data.filter(sg => sg.sv_id === sv_id);
        let genes: (string | undefined)[] = [];
        if (thisSVgenes.length > 0) {
          genes = thisSVgenes.map(g => g.symbol)
        }
        return genes;
      }
      const data = PS.map(d => {
        // get genes
        const genes = findSymbols(SV_genes_with_symbol, d.sv_id)


        // get cds
        const cds = findSymbols(SV_cds_with_symbol, d.sv_id)
        // exons
        const exons = findSymbols(SV_exon_with_symbol, d.sv_id);
        return {
          ...d,
          genes,
          cds,
          exons
        }
      })
      // SV carriers

      // if carriers are family members
      console.log(PS);
      res.json({
        status: 500,
        data: data
      })
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log('server is running on port ' + port);
})

