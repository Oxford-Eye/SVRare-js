// sqlite3's node-gyp relies on python2, not compatible with python3. so relies on the un-released-yet commit
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cors from 'cors';
import db from './config/database.config';
import { initModels } from './model/init-models';

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
models.SV.hasMany(models.patient_SV, {
  foreignKey: { name: 'sv_id' }
});
models.patient_SV.belongsTo(models.SV, {
  foreignKey: { name: 'sv_id' }
});
models.SV.belongsToMany(models.gene, { through: 'SV_gene', foreignKey: { name: 'sv_id' } });
models.gene.belongsToMany(models.SV, { through: 'SV_gene', foreignKey: { name: 'gene_id' } });

app.get("/", async (_, res: Response) => {
  // type for the distinct family result
  type Family = { 'DISTINCT': string };

  try {
    const data: Family[] = await models.patient.aggregate('family_id', 'DISTINCT', { plain: false });
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
    const proband = await models.patient.findOne({
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
      // all SVs found in patient
      const SVs = await models.patient_SV.findAll({
        where: { patient_id: proband.id },
        include: [{
          model: models.SV,
          required: true
        }],
        offset: page * pageSize,
        limit: pageSize
      });
      res.json({
        status: 500,
        data: SVs
      })
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log('server is running on port ' + port);
})