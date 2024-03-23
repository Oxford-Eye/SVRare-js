import React from 'react'
import CircularProgress from '@mui/material/CircularProgress'

type LoadingProp = {
  loading: boolean
}
const Loading: React.FC<LoadingProp> = props => {
  return (
    props.loading
      ? <div className='-loading -active'>
        <div className='-loading-inner'>
          <CircularProgress />
        </div>
      </div>
      : null
  )
}

export default Loading;