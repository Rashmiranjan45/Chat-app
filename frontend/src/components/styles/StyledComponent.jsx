import { styled } from "@mui/material";


export const VisuallyHiddenInput = styled("input")({
    border:0,
    clip:"rect(0 0 0 0)",
    height:1,
    margin:-1,
    overflow:"hidden",
    padding:"absolute",
    whiteSpace:"nowrap",
    width:1
})