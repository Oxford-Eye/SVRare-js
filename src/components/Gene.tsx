import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { createTheme } from '@material-ui/core/styles';

type GeneProps = {
  id: number,
  symbol: string,
  pli: number | null,
  prec: number | null,
  oe_lof_upper: number | null,
  hpoHighlight: boolean,
}

const theme = createTheme();

const Gene: React.FC<GeneProps> = (props) => {
  return (
    <Card key={props.id} className="gene-card" style={{
      margin: '10px',
      minWidth: '5vw',
    }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent>
          <Typography component="div" variant="body2" style={{
            color: props.hpoHighlight ? 'green' : 'black',
          }}>
            {props.symbol}
          </Typography>
        </CardContent>
        <CardContent>
          <Typography variant="subtitle2" color="textSecondary" component="div">
            pLI: {props.pli}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" component="div">
            pRec: {props.prec}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  )
}

export default Gene