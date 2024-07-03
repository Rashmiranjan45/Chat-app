import { useEffect, useState } from "react"
import toast from "react-hot-toast"



const useErrors = (errors = []) => {

    useEffect(() => {
        errors.forEach(({isError,error,fallback}) => {
            if (isError) {
                if(fallback) fallback()
                else toast.error(error?.data?.message || "Something went wrong")
            }
        })
    },[errors])
}

const useAsyncMutation = (mutationHook) => {
    const [isLoading,setIsLoading] = useState(false)
    const [data,setData] = useState(null)

    const [mutate] = mutationHook() 

    const exexuteMutation = async(toastMessage,...args) => {
        setIsLoading(true)
        const toastId = toast.loading(toastMessage || "Updating data...")
        try {
            const res = await mutate(...args)

            if (res.data) {
                toast.success(res.data.message || "Data updated successfully.",{id:toastId})
                setData(res.data)
            }else {
                toast.error(res.error.data.message || "something went wrong",{id:toastId})
            }
        } catch (error) {
            console.log(error)
            toast.error("something went wrong",{id:toastId})
        }finally {
            setIsLoading(false)
        }
    }
    return [exexuteMutation,isLoading,data]
}


export {
    useErrors,
    useAsyncMutation
}