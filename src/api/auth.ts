import { apiRequest } from './client'


export type AuthUser = {
    id: number
    first_name: string
    last_name: string
    email: string
    login: string
    email_verified: boolean
    created_at: string
}


export type AuthResponse = {
    access_token: string
    token_type: string
    user: AuthUser
}


export type RegisterUserRequest = {
    first_name: string
    last_name: string
    email: string
    login: string
    password: string
    password_repeat: string
}


export type LoginUserRequest = {
    login: string
    password: string
}


export function registerUser(
    registration: RegisterUserRequest,
): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
        '/register',
        {
            method: 'POST',
            body: registration,
        },
    )
}


export function loginUser(
    credentials: LoginUserRequest,
): Promise<AuthResponse> {
    return apiRequest<AuthResponse>(
        '/login',
        {
            method: 'POST',
            body: credentials,
        },
    )
}


export function getCurrentUser(
    token: string,
): Promise<AuthUser> {
    return apiRequest<AuthUser>(
        '/me',
        {
            token,
        },
    )
}