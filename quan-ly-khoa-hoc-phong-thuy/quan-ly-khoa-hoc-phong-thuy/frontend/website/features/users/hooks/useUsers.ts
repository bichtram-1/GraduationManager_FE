import useSWR from "swr"
import { userApi } from "../api/userApi"

export const useUsers = () => {
    return useSWR("users", userApi.getUsers)
}