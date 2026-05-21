"use server"

import axiosInstance from "@/lib/axios/axios-config"

export const getContents = async () => {
    const response = await axiosInstance.get("https://jsonplaceholder.typicode.com/photos")
    return response.data.slice(0, 5)
}