// sqlite3's node-gyp relies on python2, not compatible with python3. so relies on the un-released-yet commit
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import db from './config/database.config';
import { initModels } from './model/init-models';
import { QueryTypes, Op } from 'sequelize';

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
      console.log(HPO);
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

const KNOWN_GENEs = ["ABCA4", "ABCC6", "ABHD12", "ACBD5", "ADAM9", "ADAMTS18", "ADIPOR1", "ADIPORT", "AGBL5", "AHI1", "AIPL1", "ALMS1", "APOE", "ARHGEF18", "ARL13B", "ARL2BP", "ARL3", "ARL6", "ARMS2", "ASRGL1", "ATF6", "ATOH7", "ATXN7", "BBIP1", "BBS1", "BBS10", "BBS12", "BBS2", "BBS3", "BBS4", "BBS5", "BBS6", "BBS7", "BBS8", "BBS9", "BEST1", "C12orf65", "C1QTNF5", "C2", "C21orf2", "C2orf71", "C3", "C8orf37", "CA4", "CABP4", "CACNA1F", "CACNA2D4", "CAPN5", "CC2D2A", "CCT2", "CDH23", "CDH3", "CDH5", "CDHR1", "CEP164", "CEP250", "CEP290", "CEP78", "CERKL", "CFB", "CFH", "CHM", "CIB2", "CLN3", "CLN5", "CLN6", "CLN8", "CLRN1", "CLRN3", "CLUAP1", "CNGA1", "CNGA3", "CNGB1", "CNGB3", "CNNM4", "COL11A1", "COL11A2", "COL2A1", "COL9A1", "CRB1", "CRX", "CSPP1", "CST3", "CTNNA1", "CTSD", "CYP4V2", "DFNB31", "DHDDS", "DHX38", "DMD", "DNAAF2", "DNAH5", "DNAI1", "DNAI2", "DRAM2", "EFEMP1", "ELOVL4", "EMC1", "ERCC6", "EXOSC2", "EYS", "FAM161A", "FBLN5", "FLVCR1", "FSCN2", "FZD4", "GDF6", "GNAT1", "GNAT2", "GNB3", "GNPTG", "GPR125", "ADGRA3", "GPR179", "GPR98", "GPR98", "ADGRV1", "GRK1", "GRM6", "GUCA1A", "GUCA1B", "GUCY2D", "HARS", "HK1", "HMCN1", "HMX1", "HRG4", "HTRA1", "IDH3B", "IFT140", "IFT27", "IFT43", "IL8", "IMPDH1", "IMPG1", "IMPG2", "INPP5E", "INVS", "IQCB1", "ITM2B", "JAG1", "KCNJ13", "KCNV2", "KIAA1549", "KIF11", "KIZ", "KLHL7", "LAMA1", "LAPTM4A", "LCA5", "LGR4", "LRAT", "LRIT3", "LRP5", "LZTFL1", "MAK", "MAPKAPK3", "MERTK", "MFN2", "MFRP", "MFSD8", "MKKS", "MKS1", "MT-ATP6", "MTTP", "MVK", "MYO7A", "NDP", "NEK2", "NEUROD1", "NF1", "NME8", "NMNAT1", "NOTCH2", "NPHP1", "NPHP3", "NPHP4", "NR2E3", "NR2F1", "NRG4", "NRL", "NYX", "OAT", "OFD1", "OPA1", "OPA3", "OPN1LW", "OPN1MW", "OPN1SW", "OPN5", "OR2W3", "OTX2", "PAHX", "PANK2", "PAX2", "PAX6", "PCDH15", "PCDH21", "PCYT1A", "PDE6A", "PDE6B", "PDE6C", "PDE6G", "PDE6H", "PDZD7", "PEX1", "PEX2", "PEX26", "PEX6", "PEX7", "PGK1", "PHYH", "PITPNM3", "PLA2G5", "PLEKHA1", "PLK4", "PNPLA6", "POC1B", "POMGNT1", "PON1", "PPT1", "PRCD", "PRDM13", "PROM1", "PRPF3", "PRPF31", "PRPF4", "PRPF6", "PRPF8", "PRPH2", "PRPS1", "PXMP3", "RAB28", "RAX2", "RB1", "RBP3", "RBP4", "RCBTB1", "RD3", "RDH11", "RDH12", "RDH5", "REEP6", "RGR", "RGS9", "RGS9BP", "RHO", "RIM1", "RIMS1", "RLBP1", "ROM1", "RP1", "RP1L1", "RP2", "RP9", "RPE65", "RPGR", "RPGRIP1", "RPGRIP1L", "RS1", "SAG", "SAMD11", "SAMD7", "SDCCAG8", "SEMA4A", "SERPING1", "SLC19A2", "SLC24A1", "SLC38A8", "SLC7A14", "SNRNP200", "SPATA7", "SRD5A3", "TEAD1", "TEMEM67", "TIMM8A", "TIMP3", "TLR3", "TLR4", "TMEM126A", "TMEM237", "TMEM67", "TOPORS", "TPP1", "TREX1", "TRIM32", "TRNT1", "TRPM1", "TRTN1", "TSPAN12", "TTC8", "TTLL5", "TTPA", "TUB", "TULP1", "UNC119", "USH1C", "USH1G", "USH2A", "VCAN", "VPS13B", "WDPCP", "WDR19", "WFS1", "ZNF408", "ZNF423", "ZNF513"];