import React from 'react'
import AppLayout from '../components/layout/AppLayout'
import { Box, Typography } from '@mui/material'
import { grayColor } from '../components/constants/color'

function Home() {
  return (
    <Box bgcolor={grayColor} height={"100%"}>
      <Typography variant='h5' p={"2rem"} textAlign={"center"}>
        Select a Friend to Chat 
      </Typography>

    </Box>
  )
}

export default AppLayout()(Home)
