import useSWRMutation from "swr/mutation";
import { AxiosResponse } from "axios";
import { IFormAuth } from "../types";
import { login } from "../api/loginApi";

export const useLogin = () => {
    const { trigger, data, error, isMutating } = useSWRMutation<
        AxiosResponse<IFormAuth>,  // Data trả về
        Error,               // Error type
        string,              // Key type (ký tự literal “login”)
        IFormAuth            // Arg type
    >(
        "login",
        // fetcher đúng chữ ký: (key, {arg}) => ...
        async (key, { arg }) => {
        // arg là IFormAuth
        return await login(arg);
        }
    );

    return { trigger, data, error, isMutating }
}