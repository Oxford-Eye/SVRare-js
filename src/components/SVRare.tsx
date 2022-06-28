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
import Igv, { IgvDivProps } from './Igv';
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

type Proband = {
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
  proband: Proband,
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
      }, SV: []
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
        if (size > IGV_MAX_VIEW) {
          // split breaking points
          browsers = [
            {
              divId: 0,
              igvOptions: {
                genome: process.env.REACT_APP_GENOME_BUILD!,
                locus: `${row.original['sv.chrom']}:${Math.round(row.original['sv.start'] - IGV_BP_PADDING)}-${Math.round(row.original['sv.start'] + IGV_BP_PADDING)}`,
                tracks: [{
                  name: stateData.data.proband.name,
                  type: 'alignment',
                  format: 'bam',
                  url: stateData.data.proband.bam_path,
                  indexURL: stateData.data.proband.bam_path + '.bai',
                  displayMode: 'SQUISHED',
                }, {
                  name: stateData.data.proband.name,
                  type: 'variant',
                  format: 'vcf',
                  url: stateData.data.proband.manta_path,
                  indexURL: stateData.data.proband.manta_path + '.tbi',
                }
                ],
              }
            }, {
              divId: 1,
              igvOptions: {
                genome: process.env.REACT_APP_GENOME_BUILD!,
                locus: `${row.original['sv.chrom']}:${Math.round(row.original['sv.end'] - IGV_BP_PADDING)}-${Math.round(row.original['sv.end'] + IGV_BP_PADDING)}`,
                tracks: [{
                  name: stateData.data.proband.name,
                  type: 'alignment',
                  format: 'bam',
                  url: stateData.data.proband.bam_path,
                  indexURL: stateData.data.proband.bam_path + '.bai',
                  displayMode: 'SQUISHED',
                }, {
                  name: stateData.data.proband.name,
                  type: 'variant',
                  format: 'vcf',
                  url: stateData.data.proband.manta_path,
                  indexURL: stateData.data.proband.manta_path + '.tbi',
                }
                ],
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
                tracks: [{
                  name: stateData.data.proband.name,
                  type: 'alignment',
                  format: 'bam',
                  url: stateData.data.proband.bam_path,
                  indexURL: stateData.data.proband.bam_path + '.bai',
                  displayMode: 'SQUISHED',
                  visibilityWindow: IGV_MAX_VIEW * (1 + 2 * IGV_SV_PADDING),
                }, {
                  name: stateData.data.proband.name,
                  type: 'variant',
                  format: 'vcf',
                  url: stateData.data.proband.manta_path,
                  indexURL: stateData.data.proband.manta_path + '.tbi',
                }
                ],
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

      // SVs

      const { data } = await axios.get(svUrl);

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
          a.cds.length * 2 +
          a.exons.length - a['sv.N_carriers']
        const B = b.hpoCds * 5 +
          b.hpoExons * 4 +
          b.hpoGenes * 3 +
          b.cds.length * 2 +
          b.exons.length - b['sv.N_carriers']
        return B - A
      })

      setStateData({ data: data.data, ready: true });
    } catch (err) {
      console.error(err);
    }

  }, []);
  React.useEffect(() => {
    let isLoading = true;

    getData();
    //setStateData({ data: { proband: 'test', SV: [] }, ready: true });

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
      {!stateData.ready ? <Loading loading={!stateData.ready} /> :
        <>
          <p>Disease: {stateData.data.proband.disease}</p>
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