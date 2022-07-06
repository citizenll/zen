import { useStorageLocal } from '~/composables/useStorageLocal'
import { COOLDOWN_TIME } from '~/constant'
export type ListItem = {
    url: string, precise: boolean
}
export type List = ListItem[]
export type InitialValue = {
    count: number
    urlList: List
    pause: boolean
    stopTime: number
    blockTime: number
    debug: boolean
}

const initialValue: InitialValue = {
    stopTime: 0,
    blockTime: 0,
    count: 0,
    pause: false,
    debug: true,
    urlList: []
}
export const storageZen = useStorageLocal('zen-store1', initialValue, { listenToStorageChanges: true })

export const isCooldown = () => {
    const now = Date.now()
    return storageZen.value.stopTime > 0 && (storageZen.value.stopTime + COOLDOWN_TIME > now)
}
