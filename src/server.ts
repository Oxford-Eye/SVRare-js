// sqlite3's node-gyp relies on python2, not compatible with python3. so relies on the un-released-yet commit
import express, { Request, response, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import db from './config/database.config';
import { initModels } from './model/init-models';
import { QueryTypes, Op } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { SVCarrier } from './types/SVRare';
import fs from 'fs';
import { PedigreeMember } from './types/SVRare';

const ENV_FILE = process.env.ENV_FILE || '.env'
console.log(process.env.ENV_FILE)
dotenv.config({
  path: path.resolve(process.cwd(), ENV_FILE)
});

const SV_DISTANCE = process.env.SV_DISTANCE !== undefined ? process.env.SV_DISTANCE as unknown as number : 0.5

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



interface SVGene { 'sv_id': number, 'gene_id': number, 'symbol': string, 'pli': number, 'prec': number, 'oe_lof_upper': number }

const ensemblId2symbol = async (data: any[]): Promise<SVGene[]> => {
  /*
  This function is to convert ensembl id to symbol for a number of models,
  also add pli and prec to the result.
  including SV_gene, SV_exon, SV_cds
  TODO: include HPO_gene
  */
  const geneIds = data.map(d => d.gene_id);
  const query = await models.Gene.findAll({
    where: { id: geneIds }
  })
  return data.map(d => {
    const res = query.find(e => e.id === d.gene_id);

    return {
      ...d,
      symbol: res?.symbol,
      pli: res?.pli,
      prec: res?.prec,
      oe_lof_upper: res?.oe_lof_upper
    }
  })
}

app.get("/families", async (_, res: Response) => {
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

app.get("/family", async (req: Request, res: Response) => {
  // get family info from database
  const familyId = req.query.familyId as unknown as string;
  try {
    const family = await models.Patient.findAll({
      where: {
        family_id: familyId
      }
    });

    res.json({
      status: 500,
      data: family
    })
  } catch (error) {
    console.log(error);
  }
});

const getPed = async (familyId: string, pedFile: string) => {
  // get proband and members with genotype data
  try {
    const dbFamily = await models.Patient.findAll({
      where: {
        family_id: familyId
      }
    });
    const members = dbFamily.map(member => member.name)
    let proband: string | undefined,
      disease: string | undefined;
    if (dbFamily.length > 0) {
      proband = dbFamily.find(member => member.is_proband)!.name
      disease = dbFamily.find(member => member.is_proband)!.disease
    }

    // get pedigree from pedigree file
    const rawData = fs.readFileSync(pedFile, { encoding: 'utf8', flag: 'r' })
    const pedigree: PedigreeMember[] = rawData.split('\n').map(line => {
      const [FamilyId, name, father, mother, sex, affected] = line.split('\t')
      return {
        FamilyId, name, father, mother, sex, affected
      }
    }).filter(member => member.FamilyId === familyId).map(d => {
      const member: PedigreeMember = {
        name: d.name,
        display_name: d.name,
        sex: d.sex === '1' ? 'M' : d.sex === '2' ? 'F' : null,
        proband: d.name === proband,
        level: 0,
      }
      if (d.father !== '0') member.father = d.father
      if (d.mother !== '0') member.mother = d.mother
      if (d.father === '0' && d.mother === '0') member.noparents = true
      if (disease && disease !== 'missing') {
        if (d.affected === '2') {
          member.disease = disease
          member[disease] = true
        }
      }
      if (members.includes(d.name)) {
        //member.dataNotAvailable = false
      } else {
        member.dataNotAvailable = true
        member.disease = 'dataNotAvailable'
      }
      return member
    })

    // work out level / top level
    const tops = pedigree.filter(member => (!member.father) && (!member.mother))
    tops.forEach(top => {
      top.level = findLevelFromPedigree(top, pedigree, 0)
    })
    const maxLevel = Math.max(...pedigree.map(member => member.level))
    pedigree.forEach(member => {
      if (member.level === maxLevel) {
        member.top_level = true
      }
    })

    // !! Have to assign parents to members wtih 'noparents' to avoid pedigreejs from crashing!
    // https://github.com/CCGE-BOADICEA/pedigreejs/issues/143

    pedigree.forEach(member => {
      if (!member.top_level && member.noparents) {
        // find partner's parents. [if not, ...]
        const children = pedigree.filter(m => m.father === member.name || m.mother === member.name)
        if (children.length > 0) {
          const partnerNames = [... new Set(children.map(child => [child.father, child.mother]).flat())].filter(p => p !== member.name);
          const partnerWithParents = partnerNames.find(p => !(pedigree.find(m => m.name === p)!.noparents))
          const thePartner = pedigree.find(m => m.name === partnerWithParents);
          if (thePartner) {
            member.father = thePartner.father;
            member.mother = thePartner.mother;
          }
        }
      }
    })
    return pedigree
  } catch (error) {
    console.log(error);
    return []
  }
}


const findLevelFromPedigree = (member: PedigreeMember, pedigree: PedigreeMember[], level: number): number => {
  // recursively find the member's level
  const children = pedigree.filter(m =>
    m.father === member.name || m.mother === member.name
  )
  if (children.length !== 0) {
    level += 1
    return Math.max(
      ...children.map(child => findLevelFromPedigree(child, pedigree, level))
    )
  }
  return level
}

app.get("/pedigree", async (req: Request, res: Response) => {
  // get pedigree from ped files, if they are available
  const familyId = req.query.familyId as unknown as string;

  if (process.env.PEDIGREE_PATH && fs.existsSync(path.join(process.env.PEDIGREE_PATH, `${familyId}.ped`))) {
    const pedigree = await getPed(familyId, path.join(process.env.PEDIGREE_PATH, `${familyId}.ped`));
    res.json({
      status: 500,
      data: pedigree
    })
  } else {
    res.json({
      status: 500,
      data: []
    })
  }
})

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
      const findSymbols = (data: SVGene[], sv_id: number): SVGene[] => {
        const thisSVgenes = data.filter(sg => sg.sv_id === sv_id);
        let genes: SVGene[] = [];
        if (thisSVgenes.length > 0) {
          genes = thisSVgenes
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

app.get('/get_carriers', async (req: Request, res: Response) => {
  const chrom = req.query.chrom as string;
  const start = req.query.start as unknown as number;
  const end = req.query.end as unknown as number;
  const size = end - start;
  const svType = req.query.svType as string;
  const familyId = req.query.familyId as string;
  // get family members
  const families = await models.Patient.findAll({
    where: { family_id: familyId },
    raw: true,
  })
  // get SVs in close range
  let sql = `
    SELECT * FROM sv 
      JOIN Patient_SV ON sv.id = Patient_SV.sv_id 
      JOIN Patient on Patient.id = Patient_SV.patient_id
    WHERE 
      SV.chrom = "${chrom}"
    AND
      SV.sv_type = "${svType}"
    AND
      SV.end >= ${end} - ${size} * ${SV_DISTANCE}
    AND
      SV.end <= ${end} + ${size} * (1 / (1 - ${SV_DISTANCE}) - 1)
    AND
      SV.start <= ${start} + ${size}
    AND
      SV.start >= ${start} - ${size} * (1 / (1 - ${SV_DISTANCE}) - 1)
  `;
  const query: SVCarrier[] = await db.query(sql, { type: QueryTypes.SELECT });
  // get SVs within distance cutoff
  const uniqueCarrierSet: string[] = [];
  const carriers = query.map(record => {
    let similarity: number;
    const denominator = Math.max(record.end, end) - Math.min(record.start, start);
    if (denominator === 0) {
      similarity = 1
    } else {
      similarity = (Math.min(record.end, end) - Math.max(record.start, start)) / denominator;
    }
    return {
      ...record,
      similarity
    }
  }).sort((a, b) => a.similarity >= b.similarity ? -1 : 1)
    .filter(record => {
      // skip this proband
      if (record.family_id === familyId && record.is_proband) return false
      // skip repetitve samples
      if (uniqueCarrierSet.indexOf(record.name) !== -1) return false
      uniqueCarrierSet.push(record.name)
      return record.similarity >= 1 - SV_DISTANCE ? true : false
    });
  res.json({
    status: 500,
    data: carriers
  })

})

app.get('/get_geneLists', (_, res: Response) => {
  const geneLists = fs.readdirSync('./public/knownGenes');
  res.json({
    status: 500,
    data: geneLists
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