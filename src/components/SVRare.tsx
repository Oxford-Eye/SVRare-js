import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useTable, Column, useSortBy } from "react-table";
import CssBaseline from '@material-ui/core/CssBaseline'
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import '../styles/SVRare.css'
//import 'react-table/react-table.css'
//import '@material/react-text-field/dist/text-field.css';

interface StateData {
  data: SVData,
  ready: boolean,
}
interface Props {
  baseUrl: string;
}

interface SVData {
  proband: any,
  SV: any[]
}
const columns: Column<any>[] = [{
  Header: 'Chrom',
  accessor: (d) => d['sv.chrom'],
}
  , {
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
]
const SVRare: React.FC<Props> = props => {
  const [stateData, setStateData] = React.useState<StateData>({ data: { proband: null, SV: [] }, ready: false })

  const [searchParams, _] = useSearchParams();


  const getData = React.useCallback(async () => {
    // heavy lifting bit
    const familyId = searchParams.get('familyId')
    try {
      const svUrl = (props.baseUrl ? props.baseUrl : "") +
        "/patient_sv?familyId=" + familyId + "&page=0&pageSize=30";
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
      data.data.SV.forEach((record: any) => {
        ['genes', 'cds', 'exons'].forEach(feature => {
          record[feature].sort((a: string, b: string) => {
            hpoSymbols.includes(b) - hpoSymbols.includes(a)
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
        if (a['sv.N_carriers'] < b['sv.N_carriers']) return -1
        if (a['sv.N_carriers'] > b['sv.N_carriers']) return 1
        const A = a.hpoCds * 5 +
          a.hpoExons * 2 +
          a.hpoGenes
        const B = b.hpoCds * 5 +
          b.hpoExons * 2 +
          b.hpoGenes
        return B - A
      })
      data.data.SV.forEach((d: any) => {
        if (d.hpoCds) {
          console.log(d)
        }
      })
      setStateData({ data: data.data, ready: true });
    } catch (err) {
      console.error(err);
    }

  }, []);
  React.useEffect(() => {
    console.log(stateData.ready);
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
    </div>
  )
}
export default SVRare;
/*
export default class SVRare extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [],
      loading: true
    }
  }
  async getData() {
    // https://stackoverflow.com/questions/35352638/how-to-get-parameter-value-from-query-string
    const [searchParams, _] = useSearchParams();
    const url = (this.props.baseUrl ? this.props.baseUrl : "") +
      "/family/" +
      searchParams.get('familyId');
    const res = await axios.get(url)
    this.setState({ loading: false, data: res.data })
  }
  componentDidMount() {
    this.getData()
  }
  render() {
    const columns = [{
      Header: 'Chrom',
      accessor: 'sv.chrom',
    }
      , {
      Header: 'Start',
      accessor: 'sv.start',
    }
      , {
      Header: 'End',
      accessor: 'sv.end',
    }
      , {
      Header: 'Type',
      accessor: 'sv.sv_type',
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
      accessor: 'N_carriers',
    },
    {
      Header: 'gnomAD freq',
      accessor: 'gnomad_freq',
    },
    {
      Header: 'dbVAR count',
      accessor: 'dbvar_count',
    },
    {
      Header: 'Decipher freq',
      accessor: 'decipher_freq',
    },
    {
      Header: 'Genes',
      accessor: 'genes',
    },
    {
      Header: 'exons',
      accessor: 'exons',
    },
    {
      Header: 'CDS',
      accessor: 'cds',
    },
    ]
    const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable({ columns, data: this.state.data });
    return (
      <table {...getTableProps()} style={{ border: 'solid 1px blue' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    borderBottom: 'solid 3px red',
                    background: 'aliceblue',
                    color: 'black',
                    fontWeight: 'bold',
                  }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '10px',
                        border: 'solid 1px gray',
                        background: 'papayawhip',
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}
*/