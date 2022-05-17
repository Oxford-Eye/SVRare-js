import React from 'react';
import axios from 'axios';
import Loading from './Loading';
import { SVCarrier } from '../types/SVRare'
import { Tooltip } from '@material-ui/core';
import '../styles/Carrier.css'

type CarrierProps = {
  baseUrl: string,
  familyId: string,
  chrom: string,
  start: number,
  end: number,
  svType: string
}

type StateData = {
  carriers: SVCarrier[],
  ready: boolean,
}

const Carrier: React.FC<CarrierProps> = (props) => {
  const [stateData, setStateData] = React.useState<StateData>({
    carriers: [],
    ready: false,
  })
  const carriersUrl = (props.baseUrl ? props.baseUrl : "") +
    `/get_carriers?chrom=${props.chrom}&start=${props.start}&end=${props.end}&svType=${props.svType}&familyId=${props.familyId}`
  const getData = React.useCallback(async () => {
    const response = await axios.get(carriersUrl);
    const carriers: SVCarrier[] = response.data.data;
    setStateData({ carriers, ready: true });
  }, [])
  React.useEffect(() => {
    getData();
  }, [])
  return (
    <>
      {!stateData.ready ? <Loading loading={!stateData.ready} /> :
        <>{
          stateData.carriers.map(carrier => {
            const classname = carrier.family_id === props.familyId ? 'carrier family' : 'carrier';
            const relation = carrier.family_id === props.familyId ? `${carrier.relation_to_proband},` : '';
            return (
              <>
                <Tooltip key={carrier.name} title={<span style={{ whiteSpace: 'pre-line' }}>{`${relation} ${carrier.disease}\nsimilarity: ${carrier.similarity}`}</span>}>
                  <span className={classname}>{carrier.name}</span>
                </Tooltip>
              </>
            )
          })
        }</>
      }
    </>
  )
}

export default Carrier;