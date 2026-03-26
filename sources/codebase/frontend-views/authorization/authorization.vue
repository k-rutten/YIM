<template>
    <div class="user">
        <router-view v-slot="{ Component }">
            <yim-transition
                mode="out-in"
                transition-name="fade">
                <component :is="Component" @show-notification="openNotification"></component>
            </yim-transition>
        </router-view>
    </div>
</template>

<script lang="ts" src="./authorization.ts"></script>
<style lang="scss" src="./authorization.scss"></style>
