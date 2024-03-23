import * as React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTable, Column, useSortBy, Row } from "react-table";
import Loading from './Loading';
import CssBaseline from '@mui/material/CssBaseline'
import MaUTable from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { useAtom } from 'jotai'
import { igvData } from '../dataStore/igv';
import Carrier from './Carrier';
import Gene from './Gene';
import { IgvDivProps } from './Igv';
import { PedigreeMember, FamilyMember } from '../types/SVRare';
import * as pedigreejs from 'pedigreejs';
import '../../node_modules/pedigreejs/build/pedigreejs.v3.0.0-rc3.min.css'
import '../styles/SVRare.css'
//import 'react-table/react-table.css'
//import '@material/react-text-field/dist/text-field.css';


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
  const pageSize = searchParams.get('pageSize')!
  const page = searchParams.get('page')!
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
      // make it narrower
      Cell: ({ row }) => <span dangerouslySetInnerHTML={{ __html: row.original.filter ? row.original.filter.replace(';', '<br/>') : '' }} />
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
      accessor: 'cds',
      Cell: ({ row }) => {
        return (<>
          {row.original.cds.map((gene: any) => gene.id !== 'more' ? <Gene
            id={gene.id}
            symbol={gene.symbol}
            pli={gene.pli}
            prec={gene.prec}
            oe_lof_upper={gene.oe_lof_upper}
            hpoHighlight={gene.hpoHighlight}
          /> : <span>{gene.symbol}</span>)}
        </>)
      }
    },
    {
      Header: 'exons',
      accessor: 'exons',
      Cell: ({ row }) => {
        return (<>
          {row.original.exons.map((gene: any) => gene.id !== 'more' ? <Gene
            id={gene.id}
            symbol={gene.symbol}
            pli={gene.pli}
            prec={gene.prec}
            oe_lof_upper={gene.oe_lof_upper}
            hpoHighlight={gene.hpoHighlight}
          /> : <span>{gene.symbol}</span>)}
        </>)
      }
    },
    {
      Header: 'Genes',
      accessor: 'genes',
      Cell: ({ row }) => {
        return (<>
          {row.original.genes.map((gene: any) => gene.id !== 'more' ? <Gene
            id={gene.id}
            symbol={gene.symbol}
            pli={gene.pli}
            prec={gene.prec}
            oe_lof_upper={gene.oe_lof_upper}
            hpoHighlight={gene.hpoHighlight}
          /> : <span>{gene.symbol}</span>)}
        </>)
      }
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
              visibilityWindow: IGV_MAX_VIEW
            }
            if (k === 'bam_path') track.displayMode = 'SQUISHED'
            return track
          })
        }).flat();
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
        const [,igvDataSetter] = useAtom(igvData);
        return <Link to={`/igv`} onClick={() => igvDataSetter(browsers)} target="_blank">Link</Link>
      }
    }
    ]
  }, [stateData]);

  const getData = React.useCallback(async () => {
    // heavy lifting bit

    try {
      const svUrl = (props.baseUrl ? props.baseUrl : "") +
        "/patient_sv?familyId=" + familyId + "&pageSize=" + pageSize + "&page=" + page;
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
          record[feature].sort((a: any, b: any) => {
            return hpoSymbols.includes(b.symbol) + b.pli * 0.67 + b.prec * 0.33 - hpoSymbols.includes(a.symbol) - a.pli * 0.67 - a.prec * 0.33
          })
          if (record[feature].length > max_N) {
            const more = record[feature].length - max_N;
            record[feature] = record[feature].slice(0, max_N)
            record[feature].push({
              id: 'more',
              pli: null,
              prec: null,
              oe_lof_upper: null,
              symbol: `and ${more} more`
            })
          }
          record[feature].forEach((gene: any) => {
            if (hpoSymbols.includes(gene.symbol)) {
              gene.hpoHighlight = true;
            } else {
              gene.hpoHighlight = false;
            }
          })
          record[`${feature}Display`] = record[feature].map((gene: any) => {
            if (hpoSymbols.includes(gene.symbol)) {
              return `<span class="hpoGene gene">${gene.symbol}</span>`
            }
            return `<span class="gene">${gene.symbol}</span>`
          })
        })
        record.hpoGenes = record.genes.some((gene: any) => hpoSymbols.includes(gene.symbol))
        record.hpoExons = record.exons.some((gene: any) => hpoSymbols.includes(gene.symbol))
        record.hpoCds = record.cds.some((gene: any) => hpoSymbols.includes(gene.symbol))

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