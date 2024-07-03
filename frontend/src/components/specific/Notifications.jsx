import { Dialog, DialogTitle, Stack, Typography , ListItem , Avatar, Button, Skeleton } from '@mui/material'
import React, { memo } from 'react'
import { sampleNotifications } from '../constants/sampleChats'
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../../redux/api/api'
import { useErrors } from '../../hooks/hook'
import { useDispatch, useSelector } from 'react-redux'
import { setIsNotification } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'

const Notifications = () => {

  const {isNotification} = useSelector(state => state.misc)
  const dispatch = useDispatch()

  const {isLoading,data,error,isError} = useGetNotificationsQuery()
  const [acceptFriendRequest] = useAcceptFriendRequestMutation()

  const friendRequestHandler = async({_id,accept}) => {
    dispatch(setIsNotification(false))

    try {
      const res = await acceptFriendRequest({requestId:_id,accept}) 
      if (res.data) {
        console.log(res.data.message)
        toast.success(res.data.message)
      } else {
        toast.error(res.error.data.message || "Someting went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong")
      console.log(error)
    }
  }
  const closeHandler = () => {
    dispatch(setIsNotification(false))
  }
  useErrors([{error,isError}])
  return (
    <Dialog open={isNotification} onClose={closeHandler}>
      <Stack p={{xs:"1rem" , sm:"2rem"}}maxWidth={"25rem"}>
        <DialogTitle>Notification</DialogTitle>
        {
          isLoading ? <Skeleton/> : 
          <>
            {
            data?.data?.allRequests?.length > 0 ?
            (
              data?.data?.allRequests?.map(({sender,_id}) => (
              <NotificationItem
                sender={sender}
                _id={_id}
                handler={friendRequestHandler}
                key={_id}
              />
            ))
            ) : (
            <Typography textAlign={"center"}>0 Notifications</Typography> )
          }
          </>
        }
      </Stack>
    </Dialog>
  )
}

const NotificationItem = memo(({sender,_id,handler}) => {
  const {name, avatar} = sender
  return (
    <ListItem>
      <Stack 
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}    
      >
        <Avatar/>
        <Typography
          variant='body1'
          sx={{
            flexGrow:1,
            display:"-webkit-box",
            WebkitLineClamp:1,
            WebkitBoxOrient:"vertical",
            overflow:"hidden",
            textOverflow:"ellipsis",
            width:"100%"
          }}
        >
          {`${name} sent you a friend request`}
        </Typography>
          <Stack direction={{
            xs:"column",
            sm:"row"
          }}>
            <Button 
              onClick={()=> handler({_id,accept:true})}
            >
              Accept
            </Button>
            <Button 
              color='error' 
              onClick={()=> handler({_id,accept:false})}
            >
              Reject
            </Button>
          </Stack>
        </Stack>
    </ListItem>
  )
})

export default Notifications

