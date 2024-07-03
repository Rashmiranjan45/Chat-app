import React, { useRef } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { IconButton, Stack } from '@mui/material'
import { grayColor, orange } from '../components/constants/color'
import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material'
import { InputBox } from '../components/styles/StyledComponent'
import FileMenu from '../components/dialog/FileMenu'
import { sampleMessages } from '../components/constants/sampleChats'
import MessageComponent from '../components/shared/MessageComponent'

function Chat() {
  const user = {
    _id:"hejejeje",
    name:"ghdjd"
  }
  const containerRef = useRef(null)

  return (
    <>
      <Stack 
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        bgcolor={grayColor}
        height={"90%"}
        sx={{
          overflowX:"hidden",
          overflowY:"auto"
        }}
        >
        {/* message componets */}
        {
          sampleMessages.map(message => (
            <MessageComponent key={message._id} message={message} user={user}/>
          )) 
        }
      </Stack>
      <form
        style={{
          height:"10%"
        }}
      >

        <Stack 
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
          >
          <IconButton 
            sx={{
              position:"absolute",
              left:"1.5rem",
              rotate:"30deg"
            }}
          >
            <AttachFileIcon/>
          </IconButton>
        
        <InputBox placeholder='Type Message Here...'/>
        <IconButton
          type='submit'
          sx={{
            rotate:"-30deg",
            bgcolor:orange,
            color:"white",
            marginLeft:"1.5rem",
            padding:"0.5rem",
            "&:hover":{
              bgcolor:"error.dark"
            }
          }}
        >
          
          <SendIcon/>
        </IconButton>
        </Stack>
      </form>
      <FileMenu/>


    </>
  )
}

export default AppLayout()(Chat)
