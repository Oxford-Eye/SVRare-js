import { atomWithStorage } from 'jotai/utils';
import { IgvDivProps } from '../components/Igv';

const igvData = atomWithStorage<IgvDivProps[]>('igvData', [
  {
    divId: 0,
    igvOptions: {
      genome: 'hg38',
      locus: 'SOX11',
      tracks: []
    }
  }
])

export { igvData };