import React from 'react'
import { transformImage } from '../../lib/features';
import { FileOpen as FileOpenIcon} from '@mui/icons-material';

const RenderAttachment = ({file,url}) => {
    console.log(file)
    if (file === "video") {
        return (
            <video 
            src={url} 
            preload='none' 
            width={"200px"} 
            controls/>
        )
    }
    if (file === "image") {
        return (
            <img 
            src={transformImage(url,200)} 
            alt="Attachment"
            width={"200px"}
            height={"150px"}
            style={{
                objectFit:"contain"
            }}
            />
        )
    }
    if (file === "audio") {
        return (
            <audio 
            src={url} 
            preload='none' 
            controls/>
        )
    }
     else return <FileOpenIcon/>
}

export default RenderAttachment