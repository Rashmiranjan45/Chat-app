import { Drawer, Grid, Skeleton } from '@mui/material'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useErrors } from '../../hooks/hook'
import { useMyChatQuery } from '../../redux/api/api'
import { setIsMobile } from '../../redux/reducers/misc'
import Title from '../shared/Title'
import ChatList from '../specific/ChatList'
import Profile from '../specific/Profile'
import Header from './Header'
// import { getSocket } from '../../socket'
//TODO-CHAT-SHOW
const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const dispatch = useDispatch()
    const params = useParams()
    const chatId = params.chatId
    // const socket = getSocket()
    // console.log(socket.id)
    const {isMobile} = useSelector(state => state.misc)
    const {user} = useSelector(state => state.auth)


    const {isLoading,data,isError,error,refetch} = useMyChatQuery("")
    useErrors([{isError,error}])

    const handleDeleteChat = (e , _id ,groupChat) => {
      e.preventDefault()
      console.log("deleted chat",_id,groupChat)
    }

    const handleMobileClose = () => {
      dispatch(setIsMobile(false))
    }

    return (
        <>
          <Title/>
          <Header/>
          {
            isLoading ? <Skeleton/> : (
              <Drawer open={isMobile} onClose={handleMobileClose}>
                <ChatList 
                  w='70vw'
                  chats={data?.data}
                  chatId={chatId}
                  handleDeleteChat={handleDeleteChat}/>
              </Drawer>
            )
          }

          <Grid container height={"calc(100vh - 4rem)"}>
            <Grid
              item
              sm={4}
              md={3}
              sx={{
                display:{xs:"none" , sm:"block"}
              }}
              height={"100%"}
            >
              {
                isLoading ? (<Skeleton/>) : (
                  <ChatList chats={data?.data} chatId={chatId}
                    handleDeleteChat={handleDeleteChat}/>
                  )
              }
            </Grid>
            <Grid 
              item
              xs={12}
              sm={8}
              md={5}
              lg={6}
              height={"100%"}
            >
              <WrappedComponent {...props}/> 
            </Grid>
            <Grid
              item
              lg={3}
              md={4}
              sx={{
                display:{xs:"none" , md:"block"},
                padding:"2rem",
                bgcolor:"rgba(0,0,0,0.85)"
              }}
              height={"100%"}
            >
              <Profile user={user}/>
            </Grid>
          </Grid>
        </>
    )
  }
}

export default AppLayout