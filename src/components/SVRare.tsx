import * as React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTable, Column, useSortBy, Row } from "react-table";
import Loading from './Loading';
import CssBaseline from '@material-ui/core/CssBaseline'
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import { useAtom } from 'jotai'
import { igvData } from '../dataStore/igv';
import Carrier from './Carrier'
import path from 'path';
import dotenv from 'dotenv';
import { IgvDivProps } from './Igv';
import { PedigreeMember, FamilyMember } from '../types/SVRare';
import * as pedigreejs from 'pedigreejs';
import '../../node_modules/pedigreejs/build/pedigreejs.v2.1.0-rc7.css'
import '../styles/SVRare.css'
//import 'react-table/react-table.css'
//import '@material/react-text-field/dist/text-field.css';

const ENV_FILE = process.env.ENV_FILE || '.env'
dotenv.config({
  path: path.resolve(process.cwd(), ENV_FILE)
});
const IGV_MAX_VIEW = 300000;
const IGV_BP_PADDING = 500;
const IGV_SV_PADDING = 0.2;

type Patient = {
  id: number,
  name: string,
  family_id: string,
  manta_path: string,
  canvas_path: string,
  bam_path: string,
  is_solved: boolean,
  disease: string,
  is_proband: boolean,
  relation_to_proband: string
}

interface StateData {
  data: SVData,
  ready: boolean,
}
interface Props {
  baseUrl: string;
}

interface SVData {
  proband: Patient,
  pedigree: PedigreeMember[],
  family: FamilyMember[],
  SV: any[]
}

const SVRare: React.FC<Props> = props => {
  const [stateData, setStateData] = React.useState<StateData>({
    data: {
      proband: {
        id: -1,
        name: '',
        family_id: '',
        manta_path: '',
        canvas_path: '',
        bam_path: '',
        is_solved: false,
        disease: '',
        is_proband: false,
        relation_to_proband: '',
      },
      pedigree: [],
      family: [],
      SV: []
    }, ready: false
  })

  const [searchParams, _] = useSearchParams();
  const familyId = searchParams.get('familyId')!
  // Column
  const columns: Column<any>[] = React.useMemo(() => {
    return [{
      Header: 'Chrom',
      accessor: (d) => d['sv.chrom'],
    }
      , {
      id: 'start',
      Header: 'Start',
      accessor: (d) => d['sv.start'],
    }
      , {
      Header: 'End',
      accessor: (d) => d['sv.end'],
    },
    {
      Header: 'Type',
      accessor: (d) => d['sv.sv_type'],
    },
    {
      Header: 'Filter',
      accessor: 'filter',
    },
    {
      Header: 'Genotype',
      accessor: 'genotype',
    },
    {
      Header: 'VCF ID',
      accessor: 'vcf_id',
    },
    {
      Header: 'Source',
      accessor: 'source',
    },
    {
      Header: 'N_carriers',
      accessor: (d) => d['sv.N_carriers'],
    },
    {
      Header: 'carriers',
      //accessor: 'carriers',
      Cell: ({ row }) => {
        if (row.original['sv.N_carriers'] <= 1) {
          return ''
        }
        return (<Carrier
          baseUrl={props.baseUrl}
          familyId={familyId}
          chrom={row.original['sv.chrom']}
          start={row.original['sv.start']}
          end={row.original['sv.end']}
          svType={row.original['sv.sv_type']}
        />)
      }
    },
    {
      Header: 'gnomAD freq',
      accessor: (d) => d['sv.gnomad_freq'],
    },
    {
      Header: 'dbVAR count',
      accessor: (d) => d['sv.dbvar_count'],
    },
    {
      Header: 'Decipher freq',
      accessor: (d) => d['sv.decipher_freq'],
    },
    {
      Header: 'CDS',
      accessor: 'cdsDisplay',
      Cell: ({ row }) => <span dangerouslySetInnerHTML={{ __html: row.original.cdsDisplay }} />
    },
    {
      Header: 'exons',
      accessor: 'exonsDisplay',
      Cell: ({ row }) => <span dangerouslySetInnerHTML={{ __html: row.original.exonsDisplay }} />
    },
    {
      Header: 'Genes',
      accessor: 'genesDisplay',
      Cell: ({ row }) => <span dangerouslySetInnerHTML={{ __html: row.original.genesDisplay }} />
    },
    {
      id: 'hpoCds',
      Header: 'CDS overlap HPO genes',
      accessor: (d) => d.hpoCds.toString(),
    },
    {
      id: 'hpoExons',
      Header: 'Exons overlap HPO genes',
      accessor: (d) => d.hpoExons.toString(),
    },
    {
      id: 'hpoGenes',
      Header: 'Genes overlap HPO genes',
      accessor: (d) => d.hpoGenes.toString(),
    },
    {
      id: 'igv',
      Header: 'IGV',
      Cell: ({ row }) => {
        const size = row.original['sv.end'] - row.original['sv.start'];
        let browsers: IgvDivProps[] = [];
        const tracks = stateData.data.family.sort((a: FamilyMember, b: FamilyMember) => {
          // sort on proband and disease
          if (a.is_proband === b.is_proband) {
            return b.disease.length - a.disease.length
          }
          return (b.is_proband as unknown as number) - (a.is_proband as unknown as number)
        }).map(member => {
          // load all paths
          return Object.keys(member).filter(k => k.endsWith('_path') && member[k]).map(k => {
            const track: any = {
              name: member.name,
              type: k === 'bam_path' ? 'alignment' : 'variant',
              format: k === 'bam_path' ? 'bam' : 'vcf',
              url: member[k].replace(process.env.REACT_APP_PATH_REPLACE_ORIGIN, process.env.REACT_APP_PATH_REPLACE_TARGET),
              indexURL: member[k].replace(process.env.REACT_APP_PATH_REPLACE_ORIGIN, process.env.REACT_APP_PATH_REPLACE_TARGET) + (k === 'bam_path' ? '.bai' : '.tbi'),
            }
            if (k === 'bam_path') track.displayMode = 'SQUISHED'
            return track
          })
        }).flat();
        console.log(tracks);
        if (size > IGV_MAX_VIEW) {
          // split breaking points
          browsers = [
            {
              divId: 0,
              igvOptions: {
                genome: process.env.REACT_APP_GENOME_BUILD!,
                locus: `${row.original['sv.chrom']}:${Math.round(row.original['sv.start'] - IGV_BP_PADDING)}-${Math.round(row.original['sv.start'] + IGV_BP_PADDING)}`,
                tracks,
              }
            }, {
              divId: 1,
              igvOptions: {
                genome: process.env.REACT_APP_GENOME_BUILD!,
                locus: `${row.original['sv.chrom']}:${Math.round(row.original['sv.end'] - IGV_BP_PADDING)}-${Math.round(row.original['sv.end'] + IGV_BP_PADDING)}`,
                tracks,
              }
            }
          ]
        } else {
          browsers = [
            {
              divId: 0,
              igvOptions: {
                genome: process.env.REACT_APP_GENOME_BUILD!,
                locus: `${row.original['sv.chrom']}:${Math.round(row.original['sv.start'] - IGV_SV_PADDING * size)}-${Math.round(row.original['sv.end'] + IGV_SV_PADDING * size)}`,
                tracks,
              }
            }
          ]
        }

        const [_, igvDataSetter] = useAtom(igvData);
        return <Link to={`/igv`} onClick={() => igvDataSetter(browsers)} target="_blank">Link</Link>
      }
    }
    ]
  }, [stateData]);

  const getData = React.useCallback(async () => {
    // heavy lifting bit

    try {
      const svUrl = (props.baseUrl ? props.baseUrl : "") +
        "/patient_sv?familyId=" + familyId;
      const patientHpoUrl = (props.baseUrl ? props.baseUrl : "") +
        "/patient_hpo?familyId=" + familyId;
      const hpoGeneUrlBase = (props.baseUrl ? props.baseUrl : "") +
        "/hpo_genes?hpo=";
      // patient hpo
      const patientHpoRes = await axios.get(patientHpoUrl);
      const patientHpo = patientHpoRes.data.data.HPO;
      const patientHpoIds = patientHpo.map((d: any) => d.hpo_id).join(',');
      // HPO genes
      const hpoGeneUrl = hpoGeneUrlBase + patientHpoIds;
      const hpoGenesRes = await axios.get(hpoGeneUrl);
      const { hpoGenes } = hpoGenesRes.data.data;

      //pedigree
      /*
      If REACT_APP_PEDIGREE_PATH is given, use it to load pedigree.
      If not, display basic info
      */
      let pedigree: PedigreeMember[] = [];
      const pedigreeUrl = (props.baseUrl ? props.baseUrl : "") +
        "/pedigree?familyId=" + familyId;
      pedigree = (await axios.get(pedigreeUrl)).data.data;
      const pedigreeExample = [
        {
          name: 'I_3',
          display_name: 'I_3',
          sex: 'M',
          top_level: true
        },
        {
          name: 'I_4',
          display_name: 'I_4',
          sex: 'F',
          top_level: true
        },
        {
          name: '8196_NotSeq',
          display_name: '8196_NotSeq',
          sex: 'M',
          noparents: true,
          father: 'I_3',
          mother: 'I_4'
        },
        {
          name: '8197_NotSeq',
          display_name: '8197_NotSeq',
          sex: 'F',
          father: 'I_3',
          mother: 'I_4'
        },
        {
          name: '8194_NotSeq',
          display_name: '8194_NotSeq',
          sex: 'M',
          noparents: true,
          father: 'I_3',
          mother: 'I_4'
        },
        {
          name: '8195_NotSeq',
          display_name: '8195_NotSeq',
          sex: 'F',
          father: 'I_3',
          mother: 'I_4'
        },
        {
          name: 'G168387X',
          display_name: 'G168387X',
          sex: 'M',
          proband: true,
          father: '8194_NotSeq',
          mother: '8195_NotSeq',
          disease: 'Fine-Lubinsky Syndrome',
        },
        {
          name: 'G168386Y',
          display_name: 'G168386Y',
          sex: 'M',
          father: '8196_NotSeq',
          mother: '8197_NotSeq',
          disease: 'Fine-Lubinsky Syndrome',
        }
      ]
      const familyUrl = (props.baseUrl ? props.baseUrl : "") +
        "/family?familyId=" + familyId;
      const familyRes = await axios.get(familyUrl);
      // SVs

      const { data } = await axios.get(svUrl);
      data.data.family = familyRes.data.data;
      data.data.pedigree = pedigree;
      // sort genes against hpoGenes
      const hpoSymbols = hpoGenes.map((d: any) => d['gene.symbol']);
      const max_N = 5;
      data.data.SV.forEach(async (record: any) => {
        // genes, cds, exons
        ['genes', 'cds', 'exons'].forEach(feature => {
          record[feature].sort((a: string, b: string) => {
            return hpoSymbols.includes(b) - hpoSymbols.includes(a)
          })
          if (record[feature].length > max_N) {
            record[feature] = record[feature].slice(0, max_N)
            record[feature].push(`and ${record.genes.length - max_N} more`)
          }
          record[`${feature}Display`] = record[feature].map((gene: string) => {
            if (hpoSymbols.includes(gene)) {
              return `<span class="hpoGene gene">${gene}</span>`
            }
            return `<span class="gene">${gene}</span>`
          })
        })
        record.hpoGenes = record.genes.some((gene: any) => hpoSymbols.includes(gene))
        record.hpoExons = record.exons.some((gene: any) => hpoSymbols.includes(gene))
        record.hpoCds = record.cds.some((gene: any) => hpoSymbols.includes(gene))

      })

      // sort all records based on N_carriers and hpoCds / hpoExons /hpoGenes
      data.data.SV.sort((a: any, b: any) => {
        //if (a['sv.N_carriers'] < b['sv.N_carriers']) return -1
        //if (a['sv.N_carriers'] > b['sv.N_carriers']) return 1
        const A = a.hpoCds * 5 +
          a.hpoExons * 4 +
          a.hpoGenes * 3 +
          (!!a.cds.length as unknown as number) * 2 +
          (!!a.exons.length as unknown as number) - a['sv.N_carriers']

        const B = b.hpoCds * 5 +
          b.hpoExons * 4 +
          b.hpoGenes * 3 +
          (!!b.cds.length as unknown as number) * 2 +
          (!!b.exons.length as unknown as number) - b['sv.N_carriers']
        return B - A
      })
      if (data.data.pedigree.length > 0) {
        const options = {
          "targetDiv": "pedigree",
          "width": 829.3333333333334,
          "height": 500,
          "symbol_size": 35,
          "edit": false,
          "labels": [
            "disease",
          ],
          "diseases": [
            {
              type: data.data.proband.disease,
              colour: "#F68F35"
            },
            {
              type: 'dataNotAvailable',
              colour: 'lightgrey'
            }
          ],
          "DEBUG": false,
          dataset: data.data.pedigree
        }
        pedigreejs.build(options)
      }
      setStateData({ data: data.data, ready: true });
    } catch (err) {
      console.error(err);
    }

  }, []);
  React.useEffect(() => {
    let isLoading = true;

    getData();

    return () => {
      isLoading = false
    }
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: stateData.data.SV }, useSortBy);
  return (
    <div>
      <div id="pedigree"></div>
      <div id="node_properties"></div>
      {!stateData.ready ? <Loading loading={!stateData.ready} /> :
        <>
          <CssBaseline />
          <MaUTable {...getTableProps()}>
            <TableHead>
              {headerGroups.map(headerGroup => (
                <TableRow {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <TableCell
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody {...getTableBodyProps()}>
              {rows.map(row => {
                prepareRow(row)
                return (
                  <TableRow {...row.getRowProps()}>
                    {row.cells.map(cell => {
                      return (
                        <TableCell
                          {...cell.getCellProps()}

                        >
                          {cell.render('Cell')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })}
            </TableBody>
          </MaUTable>
        </>
      }
    </div>
  )
}
export default SVRare;