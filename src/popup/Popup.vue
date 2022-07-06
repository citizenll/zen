<script setup lang="ts">
import { sendMessage } from 'webext-bridge';
import { COOLDOWN_TIME, ZenEvent } from '~/constant';
import { isForbiddenUrl } from '~/env';
import { storageZen, isCooldown } from '~/logic/storage'
import { format } from 'timeago.js'
import { useI18n } from 'vue-i18n';

import logo from '~/assets/icon-512.png';
import punish from '~/assets/punish.png';
const { t } = useI18n()


const lastTimeTips = ref(t('tips.praise'))
let url = ref(''), forbidden = ref(false)
function openOptionsPage() {
    browser.runtime.openOptionsPage()
}
function closeDebug() {
    storageZen.value.debug = false
    storageZen.value.urlList.length = 0
}
function pauseBlock() {
    storageZen.value.pause = true
    storageZen.value.stopTime = Date.now()
}
function addUrl(precise = false) {
    sendMessage(ZenEvent.AddCurrentUrl, precise)
}
onMounted(() => {
    sendMessage(ZenEvent.GetCurrentUrl, null).then(data => {
        url.value = data?.toString() || ''
        forbidden.value = url.value != '' && isForbiddenUrl(url.value)
    });
})
const BLOCK_COLORS = ['text-gray-500', 'text-green-500', 'text-yellow-300', 'text-yellow-500']
let leftTime = 0, blockColor = BLOCK_COLORS[0]
const leftTimeTips = ref("")
// @ts-ignore
window['clearStore'] = () => {
    storageZen.value.blockTime = 0
    storageZen.value.stopTime = 0
}

watch(storageZen, () => {
    const now = Date.now(), value = storageZen.value
    leftTime = value.stopTime + COOLDOWN_TIME - now;
    if (leftTime <= 0) {
        leftTime = 0
        if (value.pause) value.pause = false
    }
    leftTimeTips.value = format(value.stopTime + COOLDOWN_TIME, formatLocale)
    if (value.blockTime <= 0) return;
    lastTimeTips.value = format(value.blockTime, formatLocale)
    let day = Math.floor((now - value.blockTime) / (24 * 60 * 60 * 1000))
    if (day >= 3) blockColor = BLOCK_COLORS[1]
    else if (day >= 7) blockColor = BLOCK_COLORS[2]
    else if (day >= 15) blockColor = BLOCK_COLORS[3]
}, { deep: true, flush: 'post' })
//format timeago string
const _locale = navigator.language
const formatLocale = _locale == 'zh-CN' ? 'zh_CN' : 'en_US'
const serviceAvailable = computed(() => {
    let pause = storageZen.value.pause
    return !pause && !isCooldown()
});
</script>

<template>
    <main class="w-[300px] px-4 py-3 text-gray-700 flex justify-between">
        <div class="flex items-center select-none">
            <img :src="logo" class="w-6 h-6 inline-block" />
            <h3 class="text-base font-bold inline-block ml-2">ZEN</h3>
        </div>

        <div class="flex transition">
            <template v-if="!storageZen.debug">
                <button @click="pauseBlock" class="icon-btn" v-if="serviceAvailable">
                    <carbon:pause-outline class="m-auto text-lg text-gray-500" />
                </button>
            </template>
            <button @click="openOptionsPage" class="ml-4 icon-btn">
                <carbon:settings class="m-auto text-lg text-gray-500" />
            </button>
        </div>
    </main>
    <section>
        <template v-if="serviceAvailable">
            <p class="mt-2 text-lg text-center">
                {{ t('tips.trigger_count') }}:{{ storageZen.count }}
            </p>
            <div>
                <ul>
                    <li class="py-2 pl-5 flex items-center">
                        <carbon:badge class="text-base  mr-1" :class="blockColor" /> {{ t('tips.last_trigger') }}:
                        <span class="text-red-500 ml-1">
                            {{ lastTimeTips }}
                        </span>
                    </li>
                    <li class="cursor-pointer py-2 pl-5 hover:bg-gray-100 flex items-center" v-if="storageZen.debug"
                        @click="closeDebug">
                        <carbon:debug class="text-base text-red-500 mr-1" /> {{ t('button.close_test') }}
                    </li>
                    <li class=" py-1 pl-5 hover:bg-gray-100 flex items-center justify-between" v-if="!forbidden">
                        <div class="flex items-center">
                            <carbon:pcn-z-node class="text-base text-green-500 mr-1" />
                            <span>{{ t('button.block_url') }}</span>
                        </div>

                        <div class="flex items-center">
                            <button class="icon-btn" :title="t('button.block_url_precise')" @click="addUrl(true)">
                                <mdi:link-variant class="text-base" />
                            </button>
                            <button class="icon-btn mx-3" :title="t('button.block_url_fuzzy')" @click="addUrl()">
                                <mdi:link-variant-plus class="text-base" />
                            </button>
                        </div>
                    </li>
                </ul>
            </div>
        </template>
        <template v-else>
            <p class="my-2 text-lg text-center">
                {{ t('button.paused') }}
                <template v-if="isCooldown()">
                    <span class="text-red-500">{{ leftTimeTips }}</span> {{ t('button.available') }}
                </template>
            </p>
            <img :src="punish" class="absolute select-none right-0 bottom-6 transform rotate-320 scale-80" alt="" srcset="">
        </template>
    </section>
    <p class="text-center">{{ t('tips.sentence') }}</p>
    <footer class=" bg-gray-100 text-center py-3 mt-2 select-none">
        @2022 <a href="https://github.com/citizenll">citizenl</a>
    </footer>
</template>

<style>
.icon-btn {
    @apply hover: bg-gray-200 flex items-center justify-center rounded p-0.5 w-7 h-7
}
</style>