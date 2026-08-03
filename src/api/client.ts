const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
    throw new Error(
        'Не указана переменная VITE_API_URL во frontend-файле .env',
    )
}


type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    token?: string
}


export class ApiError extends Error {
    status: number
    responseBody: unknown

    constructor(
        status: number,
        message: string,
        responseBody: unknown,
    ) {
        super(message)

        this.name = 'ApiError'
        this.status = status
        this.responseBody = responseBody
    }
}


function getErrorMessage(
    responseBody: unknown,
): string {
    if (
        typeof responseBody !== 'object'
        || responseBody === null
        || !('detail' in responseBody)
    ) {
        return 'Backend вернул ошибку'
    }

    const detail = responseBody.detail

    if (typeof detail === 'string') {
        return detail
    }

    if (Array.isArray(detail)) {
        const messages = detail.flatMap((item) => {
            if (
                typeof item !== 'object'
                || item === null
                || !('msg' in item)
                || typeof item.msg !== 'string'
            ) {
                return []
            }

            return [
                item.msg.replace(
                    /^Value error,\s*/,
                    '',
                ),
            ]
        })

        if (messages.length > 0) {
            return messages.join('\n')
        }
    }

    return 'Введённые данные не прошли проверку'
}


export async function apiRequest<ResponseType>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<ResponseType> {
    const headers = new Headers({
        Accept: 'application/json',
    })

    if (options.body !== undefined) {
        headers.set(
            'Content-Type',
            'application/json',
        )
    }

    if (options.token) {
        headers.set(
            'Authorization',
            `Bearer ${options.token}`,
        )
    }

    const response = await fetch(
        `${API_URL}${path}`,
        {
            method: options.method ?? 'GET',
            headers,
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
        },
    )

    const responseBody: unknown = await response
        .json()
        .catch(() => null)

    if (!response.ok) {
        throw new ApiError(
            response.status,
            getErrorMessage(responseBody),
            responseBody,
        )
    }

    return responseBody as ResponseType
}