import axiosInstance from "@/lib/axios/axios-config"

export const userApi = {
    getUsers: async () => {
        const response = await axiosInstance.get("https://jsonplaceholder.typicode.com/users")
        return response.data.slice(0, 10)
    }
}