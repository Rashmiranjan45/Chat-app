import { useInputValidation } from '6pp'
import { Button, Container, Paper, TextField, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { Navigate } from 'react-router-dom'
import { adminLogin, getAdmin } from '../../redux/thunks/admin'



const AdminLogin = () => {
  const {isAdmin} = useSelector(state => state.auth)
  const dispatch = useDispatch()
  const secretKey = useInputValidation("")
  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(adminLogin(secretKey.value))
  }
  console.log("AdminLogin Rendered", isAdmin)
  useEffect(() => {
    dispatch(getAdmin())
  },[dispatch])

  if(isAdmin) return <Navigate to="/admin/dashboard"/>

  return (
    <div style={{
      backgroundImage:
        "linear-gradient(rgba(200,200,200,0.5),rgba(120,110,220,0.5))"
    }}>
    <Container 
      component={"main"} 
      maxWidth="xs"
      sx={{
        height:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:'center'
      }}>
      <Paper 
        elevation={3}
        sx={{
          padding:4,
          display:'flex',
          flexDirection:"column",
          alignItems:"center"
      }}
      >
        <Typography variant='h5'>Admin Login</Typography>
        <form 
          style={{
            width:"100%",
            marginTop:"1rem"
          }}
          onSubmit={submitHandler}>
            <TextField 
              required
              fullWidth
              type='password'
              label="Secret Key"
              margin='normal'
              variant='outlined'
              value={secretKey.value}
              onChange={secretKey.changeHandler}
            />
            <Button 
              fullWidth
              sx={{marginTop:"1rem"}} 
              type='submit'  
              variant='contained' 
              color='primary' 
            >
              Login
            </Button>
        </form>
      </Paper>
    </Container>
    </div>
  )
}

export default AdminLogin