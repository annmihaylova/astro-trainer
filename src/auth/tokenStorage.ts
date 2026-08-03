const ACCESS_TOKEN_KEY =
    'astro-trainer:access-token:v1'


export function getAccessToken(): string | null {
    try {
        return localStorage.getItem(
            ACCESS_TOKEN_KEY,
        )
    } catch {
        return null
    }
}


export function setAccessToken(
    token: string,
): void {
    localStorage.setItem(
        ACCESS_TOKEN_KEY,
        token,
    )
}


export function clearAccessToken(): void {
    localStorage.removeItem(
        ACCESS_TOKEN_KEY,
    )
}