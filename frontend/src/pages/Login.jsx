import { Button, Container, Paper, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

function Login() {
  const [isLogin , setIsLogin] = useState(true)
  const toggleLogin = () => {
    setIsLogin(prev => !prev)
  }
  return (
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
        {isLogin ? 
        <>
        <Typography variant='h5'>Login</Typography>
        <form style={{
          width:"100%",
          marginTop:"1rem"
        }}>
          <TextField 
            required
            fullWidth
            label="username"
            margin='normal'
            variant='outlined'
          />
          <TextField 
            required
            fullWidth
            type='password'
            label="password"
            margin='normal'
            variant='outlined'
          />
          <Button 
          sx={{marginTop:"1rem"}} 
          type='submit' 
          fullWidth 
          variant='contained' 
          color='primary' 
          >
            Login
          </Button>

          <Typography sx={{textAlign:"center", m:"1rem"}}>
            OR
          </Typography>

          <Button 
          fullWidth 
          variant='text' 
          onClick={toggleLogin}
          >
            Sign Up Instead
          </Button>
        </form>
        </>
        : 
        <>
        <Typography variant='h5'>Login</Typography>
        <form style={{
          width:"100%",
          marginTop:"1rem"
        }}>
          <TextField 
            required
            fullWidth
            label="Name"
            margin='normal'
            variant='outlined'
          />
          <TextField 
            required
            fullWidth
            label="Bio"
            margin='normal'
            variant='outlined'
          />
          <TextField 
            required
            fullWidth
            label="username"
            margin='normal'
            variant='outlined'
          />
          <TextField 
            required
            fullWidth
            type='password'
            label="password"
            margin='normal'
            variant='outlined'
          />
          <Button 
          sx={{marginTop:"1rem"}} 
          type='submit' 
          fullWidth 
          variant='contained' 
          color='primary' 
          >
            Sign Up
          </Button>

          <Typography sx={{textAlign:"center", m:"1rem"}}>
            OR
          </Typography>

          <Button 
          fullWidth 
          variant='text' 
          onClick={toggleLogin}
          >
            Login Instead
          </Button>
        </form>
        </>}
      </Paper>
      
    </Container>
  )
}

export default Login
