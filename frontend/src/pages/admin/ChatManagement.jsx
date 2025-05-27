import { useFetchData } from '6pp'
import { Avatar, Skeleton, Stack } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { server } from '../../components/constants/config'
import AdminLayout from '../../components/layout/AdminLayout'
import AvatarCard from "../../components/shared/AvatarCard"
import Table from '../../components/shared/Table'
import { useErrors } from '../../hooks/hook'
import { transformImage } from "../../lib/features"
const columns = [
  {
    field:"id",
    headerName:"ID",
    headerClassName:"table-header",
    width:200
  },
  {
    field:"avatar",
    headerName:"Avatar",
    headerClassName:"table-header",
    width:150,
    renderCell: (params) => <AvatarCard  avatar = {params.row.avatar}/>
  },
  {
    field:"name",
    headerName:"Name",
    headerClassName:"table-header",
    width:300
  },
  {
    field:"groupChat",
    headerName:"Group",
    headerClassName:"table-header",
    width:300
  },
  {
    field:"totalMembers",
    headerName:"Total Members",
    headerClassName:"table-header",
    width:150
  },
  {
    field:"members",
    headerName:"Members",
    headerClassName:"table-header",
    width:400,
    renderCell:(params) => <AvatarCard max={100} avatar={params.row.members}/>
  },
  {
    field:"totalMessages",
    headerName:"Total Messages",
    headerClassName:"table-header",
    width:120
  },
  {
    field:"creator",
    headerName:"Created By",
    headerClassName:"table-header",
    width:250,
    renderCell:(params) => (
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
      >
        <Avatar
          alt={params.row.creator.name}
          src={params.row.creator.avatar}
        />
        <span>{params.row.creator.name}</span>
      </Stack>
    )
  },
]

const ChatManagement = () => {

  const {loading,data,error} = useFetchData(
    `${server}/api/v1/admin/chats`,
    "dashboard-chats"
  );

  useErrors([{
    isError: error,
    error: error
  }])

  const [rows, setRows] = useState([])

  useEffect(() => {
    if (data) {
      console.log("ChatManagement Rendered", data?.data?.chats.avatar)
      setRows(data?.data?.chats.map((i) => ({
      ...i,
      id:i._id,
      avatar: i.avatar.map((i) =>i),
      members:i.members.map((i) => i.avatar),
      creator:{
        name:i.creator.name,
        avatar:i.creator.avatar
      }

    })))
    }
  }, [data])
  

  return (
    <AdminLayout>
      {loading ? 
        (<Skeleton height={"100vh"}/>) : (
        <Table heading={"All Chats"} columns={columns} rows={rows}/>
      )}
    </AdminLayout>
  )
}

export default ChatManagement