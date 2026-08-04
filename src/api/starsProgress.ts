import { apiRequest } from './client'


export type StarsStudyMode =
    | 'main'
    | 'all'


export type StarsPromptKind =
    | 'name'
    | 'position'


export type StarsProgressItem = {
    item_id: string
    streak: number
    correct_answers: number
    wrong_answers: number
    learned: boolean
    next_prompt_kind: StarsPromptKind
}


export type StarsProgressWrite = {
    items: StarsProgressItem[]
    queue: string[]
}


export type StarsProgressRead =
    StarsProgressWrite & {
        has_saved_progress: boolean
    }


export type StarsProgressResetResponse = {
    message: string
}


export function getStarsProgress(
    token: string,
    mode: StarsStudyMode,
): Promise<StarsProgressRead> {
    return apiRequest<StarsProgressRead>(
        `/progress/stars/${mode}`,
        {
            token,
        },
    )
}


export function saveStarsProgress(
    token: string,
    mode: StarsStudyMode,
    progress: StarsProgressWrite,
): Promise<StarsProgressRead> {
    return apiRequest<StarsProgressRead>(
        `/progress/stars/${mode}`,
        {
            method: 'PUT',
            token,
            body: progress,
        },
    )
}


export function clearStarsProgress(
    token: string,
    mode: StarsStudyMode,
    itemIds: readonly string[],
): Promise<StarsProgressResetResponse> {
    return apiRequest<StarsProgressResetResponse>(
        `/progress/stars/${mode}/reset`,
        {
            method: 'POST',
            token,
            body: {
                item_ids: itemIds,
            },
        },
    )
}