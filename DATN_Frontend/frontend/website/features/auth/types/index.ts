export interface IFormAuth {
    email: string
    password: string
}

export type Authkeys = keyof IFormAuth

export type FormMode = "login" | "signup"