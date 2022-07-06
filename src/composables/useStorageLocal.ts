import { storage } from 'webextension-polyfill'
import {
    MaybeRef,
    RemovableRef,
    StorageAsyncOptions,
    StorageLikeAsync,
    useThrottleFn
} from '@vueuse/core'
import {
    useStorageAsync
} from '@vueuse/core'

const storageLocal: StorageLikeAsync = {
    removeItem(key: string) {
        return storage.local.remove(key)
    },

    setItem(key: string, value: string) {
        return storage.local.set({ [key]: value })
    },

    async getItem(key: string) {
        return (await storage.local.get(key))[key]
    },
}
export const useStorageLocal = <T>(
    key: string,
    initialValue: MaybeRef<T>,
    options?: StorageAsyncOptions<T>,
): RemovableRef<T> => {
    const rawInit: T = unref(initialValue)
    const data = useStorageAsync(key, initialValue, storageLocal, options)
    const handle = async (e: any) => {
        if (!e || !e[key]) return
        e = e[key]
        const rawValue: any = e ? e.newValue : await storageLocal.getItem(key)
        if (rawValue == null) {
            data.value = rawInit
            await storageLocal.setItem(key, JSON.stringify(rawInit))
        } else {
            data.value = JSON.parse(rawValue)
        }
    }
    const listener = useThrottleFn(handle, 1000)
    storage.onChanged.addListener(listener)
    return data
}