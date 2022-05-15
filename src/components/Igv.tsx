
import React from 'react';
import { useLocation } from 'react-router-dom';
import igv from 'igv';
import { useAtom } from 'jotai';
import { igvData } from '../dataStore/igv'
//import { useSearchParams } from 'react-router-dom';

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
type IgvPageProps = {
  browsers: IgvDivProps[]
}


const IgvPage: React.FC = () => {
  const [browsers] = useAtom(igvData);
  console.log(browsers[0])
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
  }, []);
  return (
    <>
      <div id={props.divId.toString()} style={igvStyle}></div>
    </>
  );

}

export default IgvPage;