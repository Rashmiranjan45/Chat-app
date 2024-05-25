import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from '@mui/material'
import {CameraAlt as CameraAltIcon, CenterFocusStrong} from "@mui/icons-material"
import React, { useState } from 'react'
import { VisuallyHiddenInput } from '../components/styles/StyledComponent'
import {useFileHandler, useInputValidation} from "6pp"
import { usernameValidator } from '../utils/validators'
function Login() {
  const [isLogin , setIsLogin] = useState(true)
  const toggleLogin = () => {
    setIsLogin(prev => !prev)
  }
  const name = useInputValidation("")
  const bio = useInputValidation("")
  const username = useInputValidation("",usernameValidator)
  const password = useInputValidation("")
  const avatar = useFileHandler("single")

  const handleSignup = (e) => {
    e.preventDefault()
  }
  const handleLogin = (e) => {
    e.preventDefault()
  }

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
        {isLogin ? 
        <>
        <Typography variant='h5'>Login</Typography>
        <form style={{
          width:"100%",
          marginTop:"1rem"
        }}
        onSubmit={handleLogin}>
          <TextField 
            required
            fullWidth
            label="username"
            margin='normal'
            variant='outlined'
            value={username.value}
            onChange={username.changeHandler}
          />
          <TextField 
            required
            fullWidth
            type='password'
            label="password"
            margin='normal'
            variant='outlined'
            value={password.value}
            onChange={password.changeHandler}
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
        <Typography variant='h5'>Sign Up</Typography>
        <form style={{
          width:"100%",
          marginTop:"1rem",
        }}
        onSubmit={handleSignup}>

          <Stack position={"relative"} width={"10rem"} margin={"auto"}>
            <Avatar sx={{
              width:"10rem",
              height:"10rem",
              objectFit:"contain"
            }}
            src={avatar.preview}
            />
            <IconButton sx={{
              position:"absolute",
              bottom:"0",
              right:"0",
              color:"white",
              bgcolor:"rgba(0,0,0,0.5)",
              ":hover":{
                bgcolor:"rgba(0,0,0,0.7)"
              },
            }}
            component = "label"
            >
              <>
              <CameraAltIcon/>
              <VisuallyHiddenInput 
                type='file' 
                onChange={avatar.changeHandler}/>
              </>
            </IconButton>
          </Stack>

          {avatar.error && 
          (
            <Typography 
              color="error" 
              variant='caption'
              m={"1rem auto"}
              width={"fit=content"}
              display={"block"}
              >
              {avatar.error}
            </Typography>
          )
          }

          <TextField 
            required
            fullWidth
            label="Name"
            margin='normal'
            variant='outlined'
            value={name.value}
            onChange={name.changeHandler}
          />
          <TextField 
            required
            fullWidth
            label="Bio"
            margin='normal'
            variant='outlined'
            value={bio.value}
            onChange={bio.changeHandler}
          />
          <TextField 
            required
            fullWidth
            label="username"
            margin='normal'
            variant='outlined'
            value={username.value}
            onChange={username.changeHandler}
          />

          {username.error && (
            <Typography color="error" variant='caption'>
              {username.error}
            </Typography>
          )
          }

          <TextField 
            required
            fullWidth
            type='password'
            label="password"
            margin='normal'
            variant='outlined'
            value={password.value}
            onChange={password.changeHandler}
          />
          <Button  
          type='submit' 
          fullWidth 
          variant='contained' 
          color='primary' 
          >
            Sign Up
          </Button>

          <Typography sx={{textAlign:"center"}}>
            OR
          </Typography>

          <Button 
          sx={{marginTop:"0 0"}}
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
    </div>
  )
}

export default Login
