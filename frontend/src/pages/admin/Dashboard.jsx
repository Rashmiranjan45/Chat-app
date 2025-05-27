import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography
} from '@mui/material'
import React from 'react'
import AdminLayout from '../../components/layout/AdminLayout'

import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon
} from '@mui/icons-material'

import { useFetchData } from '6pp'
import moment from "moment"
import { server } from '../../components/constants/config'
import { DoughnutChart, LineChart } from '../../components/specific/Charts'
import { CurveButton, SearchField } from '../../components/styles/StyledComponent'
import { useErrors } from "../../hooks/hook"


const Dashboard = () => {
  const {loading,data,error} = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );

  useErrors([{
    isError: error,
    error: error
  }])


  const Appbar = (
    <Paper 
      elevation={3}
      sx={{
        padding:"2rem",
        margin:"2rem 0",
        borderRadius:"1rem"
      }}
      >
        <Stack 
          direction={"row"} 
          alignItems={"center"} 
          spacing={"1rem"}>
          <AdminPanelSettingsIcon sx={{fontSize:"3rem"}}/>
          <SearchField placeholder='Search...'/>
          <CurveButton>Search</CurveButton>
          <Box flexGrow={1}/>
          <Typography
            display={{
              xs:"none",
              lg:"block"
            }}
            color={"rgba(0,0,0,0.7)"}
            textAlign={"center"}
          >
            {moment().format("dddd,D MMMM YYYY")}
          </Typography>
          <NotificationsIcon/>
        </Stack>
    </Paper>
  )

  const Widgets = (
    <Stack
      direction={{
        xs:"column",
        sm:"row"
      }}
      spacing={"2rem"}
      justifyContent="space-between"
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={data?.data?.stats?.usersCount} Icon={<PersonIcon/>}/>
      <Widget title={"Chats"} value={data?.data?.stats?.totalChatsCount} Icon={<GroupIcon/>}/>
      <Widget title={"Messages"} value={data?.data?.stats?.messagesCount} Icon={<MessageIcon/>}/>
    </Stack>
  );
  return (
    <AdminLayout>
      {loading ? (<Skeleton height={"100vh"}/>) : (
        <Container component={"main"}>
        {Appbar}
        <Stack
          justifyContent={"center"}
          direction={{
            xs:"column",
            lg:"row",
          }}
          alignItems={{
            xs:"center",
            lg:"stretch"
          }}
          flexWrap={"wrap"}
          sx={{
            gap:"2rem"
          }}
        >
          <Paper
            elevation={3}
            sx={{
              padding:"2rem 3.5rem",
              borderRadius:"1rem",
              width:"100%",
              maxWidth:"45rem",
            }}
          >
            <Typography variant='h4' margin={"2rem 0"}>Last Messages</Typography>
            <LineChart value={data?.data?.stats?.messagesChart || []}/>
          </Paper>
          
          <Paper
            elevation={3}  
            sx={{
              padding: "1rem ",
              borderRadius: "1rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: { xs: "100%", sm: "50%" },
              position: "relative",
              maxWidth: "25rem",
            }}
          >
            <DoughnutChart 
              value={[
                data?.data?.stats?.totalChatsCount - data?.data?.stats?.groupsCount || 0,
                data?.data?.stats?.groupsCount || 0
              ]} 
              labels={["Single Chats","Group Chats"]}
            />

            <Stack
              position={"absolute"}
              direction={"row"}
              justifyContent={"center"}
              alignItems={"center"}
              spacing={"0.5rem"}
              width={"100%"}
              height={"100%"}
            >
              <GroupIcon/>
              <Typography>Vs</Typography>
              <PersonIcon/>
            </Stack>
          </Paper>
        </Stack>
        {Widgets}
      </Container>
      )}
    </AdminLayout>
  )
}

const Widget = ({title,value,Icon}) => (
  <Paper
    elevation={3}
    sx={{
      padding:"2rem",
      margin:"2rem 0",
      borderRadius:"1.5rem",
      width:"20rem"
    }}
  >
    <Stack
      alignItems={"center"}
      spacing={"1rem"}
    >
      <Typography
        sx={{
          color:"rgba(0,0,0,0.7)",
          borderRadius:"50%",
          border:"5px solid rgba(0,0,0,0.9)",
          width:"5rem",
          height:"5rem",
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}
      >{value}</Typography>
      <Stack
        direction={"row"}
        spacing={"1rem"}
        alignItems={"center"}
      >
        {Icon}
        <Typography>{title}</Typography>
      </Stack>
    </Stack>
  </Paper>
)

export default Dashboard