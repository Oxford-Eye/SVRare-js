
import React from 'react';
import igv from 'igv/dist/igv.esm.min.js';
import { useAtom } from 'jotai';
import { igvData } from '../dataStore/igv'

let igvStyle = {
  paddingTop: '10px',
  paddingBottom: '10px',
  margin: '8px',
  border: '1px solid lightgray'
}

type track = {
  name: string,
  type: string,
  format: string,
  url: string,
  indexURL: string,
  displayMode?: string,
  visibilityWindow?: number,
};

export type IgvDivProps = {
  divId: number,
  igvOptions: {
    genome: string,
    locus: string,
    tracks: track[],
  }
}

const IgvPage: React.FC = () => {
  const [browsers] = useAtom(igvData);
  if (browsers[0].divId === 100){
    return 
  }
  return (
    <>
      {browsers.map((browser) => {
        return <IgvDiv {...browser} key={browser.divId} />
      })}
    </>
  )
}
const IgvDiv: React.FC<IgvDivProps> = props => {
  React.useEffect(() => {
    const igvContainer = document.getElementById(props.divId.toString());
    const { igvOptions } = props;
    igv.createBrowser(igvContainer, igvOptions);
  }, [props.igvOptions]);
  return (
    <>
      <div id={props.divId.toString()} style={igvStyle}></div>
    </>
  );

}

export default IgvPage;