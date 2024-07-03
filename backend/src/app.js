import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import {createServer} from "http"

const app = express()
const server = createServer(app)

app.use(
  cors(corsOptions)
);
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())


// user-endpoints...
import userRouter from "../routes/user.routes.js"
import chatRouter from "../routes/chat.routes.js"
import adminRouter from "../routes/admin.routes.js"
import { corsOptions } from "../constants/config.js"

app.use("/api/v1/user",userRouter)
app.use("/api/v1/chat",chatRouter)
app.use("/api/v1/admin",adminRouter)


export {app , server}