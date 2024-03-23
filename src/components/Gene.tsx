import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { createTheme } from '@mui/material/styles';

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