// sqlite3's node-gyp relies on python2, not compatible with python3. so relies on the un-released-yet commit
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import db from './config/database.config';
import { initModels } from './model/init-models';
import { QueryTypes, Op } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

const ENV_FILE = process.env.ENV_FILE || '.env'
dotenv.config({
  path: path.resolve(process.cwd(), ENV_FILE)
});

db.sync().then(() => {
  console.log('connet to db');
})

const models = initModels(db);

const app = express();
const port = process.env.SERVER_PORT || 9000;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ['Content-Range', 'X-Content-Range', 'range'],
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
// 
app.use(express.static(process.env.PUBLIC_PATH!))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const sess = {
  secret: "awesome ness",
  resave: false,
  saveUninitialized: false
};
app.use(session(sess));



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
      data: data.map((d: Family) => ({ familyId: d.DISTINCT }))
    })
  } catch (error) {
    console.log(error);
  }
});

app.get("/patient_sv", async (req: Request, res: Response) => {
  try {
    // Deal with genes differently (upon upload gene lists)
    let pageSize = req.query.pageSize as unknown as number;
    if (pageSize === undefined) pageSize = 50;
    const familyId = req.query.familyId as string;
    let page = req.query.page as unknown as number;
    if (page === undefined) page = 0;
    let N_carriers_max = req.query.N_carriers_max as unknown as number;
    if (N_carriers_max === undefined) N_carriers_max = 10;

    // Firstly find the proband of the family
    const proband: any = await models.Patient.findOne({
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
      // repair path to bam/vcfs. need to address this issue
      // TODO:

      ['bam_path', 'canvas_path', 'manta_path'].forEach((property: string) => {
        proband[property] = proband[property].replace(process.env.PATH_REPLACE_ORIGIN, process.env.PATH_REPLACE_TARGET)
      })

      // HPO
      const HPO = await models.Patient_HPO.findAll({
        where: { patient_id: proband.id },
        raw: true,
        include: [{
          model: models.HPO,
          required: true,
          as: "hpo",
        }]
      })
      // Patient_SV
      const PS = await models.Patient_SV.findAll({
        where: {
          patient_id: proband.id,
          is_duplicate: false
        },
        raw: true, //raw: true to return simplified data
        include: [{
          model: models.SV,
          required: true,
          as: 'sv',
          where: {
            N_carriers: { [Op.lte]: N_carriers_max }
          }
        }],
        order: [
          ['sv', 'N_carriers', 'ASC'],
          ['sv', 'gnomad_freq', 'ASC'],
          ['sv', 'dbvar_count', 'ASC'],
        ],
        offset: page * pageSize,
        //limit: pageSize
      });
      const SV_ids = [...new Set(PS.map(ps => ps.sv_id))];
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
      const data = PS.map((d: any) => {
        // get genes
        let genes = findSymbols(SV_genes_with_symbol, d.sv_id)


        // get cds
        const cds = findSymbols(SV_cds_with_symbol, d.sv_id)
        // exons
        const exons = findSymbols(SV_exon_with_symbol, d.sv_id);
        if (d['sv.sv_type'] === 'INV') {
          genes = exons
        }
        return {
          ...d,
          genes,
          cds,
          exons
        }
      })
      //let result = data.filter(d => d.exons.some(e => KNOWN_GENEs.includes(e || '')) && d.exons.length > 0)
      // SV carriers
      // if carriers are family members
      res.json({
        status: 500,
        data: {
          proband,
          SV: data
        }
      })
    }
  } catch (error) {
    console.log(error);
  }
});

app.get('/patient_hpo/', async (req: Request, res: Response) => {
  const familyId = req.query.familyId as string;
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
    // HPO
    const HPO = await models.Patient_HPO.findAll({
      where: { patient_id: proband.id },
      raw: true,
      include: [{
        model: models.HPO,
        required: true,
        as: "hpo",
      }]
    })
    res.json({
      status: 500,
      data: {
        HPO
      }
    })
  }
})

app.get('/hpo_genes', async (req: Request, res: Response) => {
  const hpoString = req.query.hpo as string;
  const hpos = hpoString.split(',') as unknown[] as number[];
  const hpoGenes = await models.HPO_Gene.findAll({
    where: { hpo_id: hpos },
    raw: true,
    include: [{
      model: models.Gene,
      required: true,
      as: "gene"
    }]
  });
  res.json({
    status: 500,
    data: {
      hpoGenes
    }
  })
})

app.get('/test', async (_, res: Response) => {
  const patient_id = 1;
  const query = await db.query(`
    SELECT *  FROM (SELECT * FROM Patient_SV WHERE patient_id = ${patient_id}) as PS JOIN SV ON PS.sv_id = SV.id
    JOIN (SELECT sv_id, symbol as cds_symbol FROM SV_cds JOIN Gene ON SV_cds.gene_id = Gene.id) as SC ON SV.id = SC.sv_id
    ORDER BY SV.N_carriers ASC, SV.gnomad_freq ASC
    LIMIT 0, 30
    `, { type: QueryTypes.SELECT })

  res.json({
    status: 500,
    data: query
  })
})

app.listen(port, () => {
  console.log('server is running on port ' + port);
})