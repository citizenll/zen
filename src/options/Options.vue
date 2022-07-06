<script setup lang="ts">
import { storageZen, getRandomColor } from '~/logic'
import Empty from '~/assets/empty.svg'

const { t } = useI18n()
const filterValue = ref('')

const showList = computed(() => {
    return storageZen.value.urlList.filter(item => item.url.includes(filterValue.value))
});

function removeLink(url: string) {
    const index = storageZen.value.urlList.findIndex(item => item.url === url)
    if (index > -1) {
        storageZen.value.stopTime = Date.now()
        storageZen.value.urlList.splice(index, 1)
    }
}

</script>

<template>
    <main class="container !max-w-screen-lg lg:px-6 mx-auto pt-$header-height max-h-screen overflow-auto p-8">

        <template v-if="storageZen.urlList.length">
            <div class="p-1 flex items-center border-gray-200 rounded-xl border-2 w-96 text-gray-700">
                <carbon:search class="text-gray-300 text-lg" />
                <input v-model="filterValue" class="p-1 focus:outline-none text-base w-full" placeholder="Search"
                    spellcheck="false" />
            </div>

            <transition-group tag="ul" name="slide-in" :style="{ '--total': showList.length }"
                class="border-2 border-gray-200 grid grid-cols-3 auto-rows-auto gap-2 p-2 mt-5 rounded-xl overflow-y-scroll max-h-3xl min-h-screen-sm ">
                <div v-for="(item, i) in showList" :key="item.url" :title="item.url"
                    class="inline p-3 bg-white shadow shadow-gray-200 rounded relative hover:shadow-inset max-h-11 short-text">
                    <span :style="{ color: getRandomColor(item.url) }">{{ item.url }} </span>

                    <button class="absolute right-1 top-1 text-gray-700" @click="removeLink(item.url)">
                        <carbon:close />
                    </button>
                </div>
            </transition-group>
        </template>
        <div v-else class="text-2xl text-center text-gray-300 select-none flex justify-center flex-col items-center">
            <img :src="Empty" w="64" />
            <div class="mt-10">
                <span>{{ t('tips.no_list') }}</span>
            </div>
        </div>
    </main>
</template>
<style>
.slide-in-move {
    transition: opacity 0.5s linear, transform 0.5s ease-in-out;
}

.slide-in-leave-active {
    transition: opacity 0.4s linear, transform 0.4s cubic-bezier(0.5, 0, 0.7, 0.4);
    transition-delay: calc(0.1s * (var(--total) - var(--i)));
}

.slide-in-enter-active {
    transition: opacity 0.5s linear, transform 0.5s cubic-bezier(0.2, 0.5, 0.1, 1);
    transition-delay: calc(0.1s * var(--i));
}

.slide-in-enter,
.slide-in-leave-to {
    opacity: 0;
}

.slide-in-enter {
    transform: translateX(-1em);
}

.slide-in-leave-to {
    transform: translateX(1em);
}

.short-text {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>