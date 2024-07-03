import { createContext, useContext, useMemo } from "react"
import io from "socket.io-client"
import { server } from "./components/constants/config"


const socketContext = createContext()

const getSocket = () => useContext(socketContext)

const SocketProvider = ({children}) => {
    const socket = useMemo(() => io(server,{withCredentials:true}),[])
    return (
        <SocketProvider value={socket}>
            {children}
        </SocketProvider>
    )
}

export {
    getSocket ,
    SocketProvider
}