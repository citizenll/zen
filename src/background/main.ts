import { watch } from 'vue'
import { onMessage, sendMessage } from 'webext-bridge'
import { COOLDOWN_TIME, ZenEvent } from '~/constant'
import { isCooldown, storageZen } from '~/logic/storage'

// only on dev mode
if (import.meta.hot) {
    // @ts-expect-error for background HMR
    import('/@vite/client')
    // load latest content script
    import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
    // eslint-disable-next-line no-console
    console.log('Extension installed')
})
let currentTabId = 0, stopService = false;
const urlSet = new Set<string>()
function loadUrl() {
    urlSet.clear()
    const value = storageZen.value
    const list = value.urlList
    console.log('loadUrl', list)
    if (list.length > 0) {
        list.forEach(item => {
            urlSet.add(item.url)
        })
    }
    stopService = isCooldown()
}

watch(storageZen, loadUrl, { deep: true });

onMessage(ZenEvent.GetCurrentUrl, async () => {
    try {
        if (!currentTabId) return;
        const tab = await browser.tabs.get(currentTabId)
        return tab?.url
    }
    catch {
        return undefined
    }
})

onMessage(ZenEvent.AddCurrentUrl, async ({ data }) => {
    const precise = data as boolean
    if (!currentTabId) return;
    const tab = await browser.tabs.get(currentTabId)
    if (!tab) return;

    let url = tab.url
    if (!url) return;

    url = getUrl(url, precise)
    let added = storageZen.value.urlList.find(item => item.url == url)
    if (added) return
    browser.notifications.create("", { type: "basic", title: "Zen Tips", message: "The current address added!", iconUrl: "../../assets/icon-512.png" })

    storageZen.value.urlList.push({ url, precise })
})


browser.tabs.onActivated.addListener(async ({ tabId }) => {
    currentTabId = tabId
})

browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab || info.status == 'unloaded') return
    if (stopService) return
    if (tab.url) {
        const test = new URL(tab.url)
        let blocked = urlSet.has(test.hostname) || urlSet.has(getUrl(tab.url, true))
        if (!blocked) return
        await browser.tabs.remove(tabId)
        storageZen.value.count++
        storageZen.value.blockTime = Date.now()
        browser.notifications.create("", { type: "basic", title: "Zen Tips", message: "The current address has been blocked!", iconUrl: "../../assets/icon-512.png" })
    }
})

const getUrl = (href: string, precise = false) => {
    const url = new URL(href);
    if (!precise) {
        return url.hostname;
    }
    href = url.href.replace(url.protocol + '//', '');
    if (href.endsWith('/')) {
        href = href.substring(0, href.length - 1);
    }
    return href;
}