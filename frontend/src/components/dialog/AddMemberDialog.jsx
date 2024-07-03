import { Button, Dialog, DialogTitle, Stack, Typography } from '@mui/material'
import React,{useState} from 'react'
import { sampleUser } from '../constants/sampleChats'
import UserItem from "../shared/UserItem"

const AddMemberDialog = ({addMember , isLoadingAddMember , chatId}) => {

    const [members, setMembers] = useState(sampleUser)
    const [selectedMembers, setSelectedMembers] = useState([])

    const selectMemberHandler = (id) => {
        setSelectedMembers((prev) => 
            prev.includes(id) 
            ? prev.filter((currElement) => currElement !== id) 
            : [...prev,id])
    }
    const closeHandler = () => {
        setSelectedMembers([])
        setMembers([])
    }
    const addMemberSubmitHandler = () => {
        closeHandler()
    }
  return (
    <Dialog open onClose={closeHandler}>
        <Stack p={"2rem"} width={"20rem"} spacing={"2rem"}>
            <DialogTitle textAlign={"center"}>Add Member</DialogTitle>
            <Stack spacing={"1rem"}>
                {
                   members.length > 0 ? ( 
                    members.map(i => (
                        <UserItem 
                            user={i} 
                            key={i._id} 
                            handler={selectMemberHandler}
                            isAdded={selectedMembers.includes(i._id)}
                            />
                    ))) : (
                        <Typography textAlign={"center"}>No Friends</Typography>
                    )
                }
            </Stack>
        <Stack 
            direction={"row"} 
            alignItems={"center"} 
            justifyContent={"space-evenly"}
        >
            <Button 
                color='error'
                onClick={closeHandler}
            >
                Cancel
            </Button>
            <Button 
                variant='contained' 
                disabled={isLoadingAddMember}
                onClick={addMemberSubmitHandler}
                >
                Submit Changes
            </Button>
            </Stack>
        </Stack>
    </Dialog>
  )
}

export default AddMemberDialog