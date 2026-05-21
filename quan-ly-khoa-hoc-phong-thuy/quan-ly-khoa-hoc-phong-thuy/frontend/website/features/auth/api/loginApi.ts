import axiosInstance from "@/lib/axios/axios-config";
import { IFormAuth } from "../types";

export const login = (data: IFormAuth) => {
    return axiosInstance.post("https://jsonplaceholder.typicode.com/users", data)
}