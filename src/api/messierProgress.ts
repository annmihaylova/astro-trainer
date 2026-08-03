import { apiRequest } from './client'


export type MessierPromptKind =
    | 'name'
    | 'position'


export type MessierProgressItem = {
    item_id: string
    streak: number
    correct_answers: number
    wrong_answers: number
    learned: boolean
    next_prompt_kind: MessierPromptKind
}


export type MessierProgressWrite = {
    items: MessierProgressItem[]
    queue: string[]
}


export type MessierProgressRead =
    MessierProgressWrite & {
        has_saved_progress: boolean
    }


export type ProgressResetResponse = {
    message: string
}


export function getMessierProgress(
    token: string,
): Promise<MessierProgressRead> {
    return apiRequest<MessierProgressRead>(
        '/progress/messier',
        {
            token,
        },
    )
}


export function saveMessierProgress(
    token: string,
    progress: MessierProgressWrite,
): Promise<MessierProgressRead> {
    return apiRequest<MessierProgressRead>(
        '/progress/messier',
        {
            method: 'PUT',
            token,
            body: progress,
        },
    )
}


export function clearMessierProgress(
    token: string,
): Promise<ProgressResetResponse> {
    return apiRequest<ProgressResetResponse>(
        '/progress/messier',
        {
            method: 'DELETE',
            token,
        },
    )
}