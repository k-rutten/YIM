<template>
    <div v-if="entityFound !== null">
        <yim-404 v-if="entityFound === false"></yim-404>
        <div v-else class="person">
            <yim-backdrop></yim-backdrop>
            <yim-detail-header :back-url="backUrl">
                <yim-detail-header-intro
                    v-if="person"
                    :title="person.fullName"
                    :sub-text="period"
                    :text="$t('Last updated on {0}', [formattedModificationDate])"
                    :image-url="imageUrl">
                    <template #description>
                        <span v-if="personnelNumber">{{ role }} {{ personnelNumber }} </span>
                        <span v-else>{{ role }} </span>
                        <a
                            v-if="person && person.emailAddress"
                            :href="'mailto:' + person.emailAddress">
                            &bull; {{ person.emailAddress }}
                        </a>
                        <a
                            v-if="phoneNumber"
                            :href="'tel:' + phoneNumber">
                            &bull; {{ phoneNumber }}
                        </a>
                        <span v-if="person && person.companyName">&bull; {{ person.companyName }}</span>
                    </template>
                    <template slot="extra">
                        <span v-if="person && person.hasBlockedEmployer">{{ $t('PersonEmployerIsBlockedWarning') }}</span>
                    </template>
                </yim-detail-header-intro>
            </yim-detail-header>

            <yim-tab-bar :links="links"></yim-tab-bar>

            <router-view class="person__content"></router-view>
        </div>
    </div>
</template>

<script lang="ts" src="./person.ts"></script>
<style lang="scss" src="./person.scss"></style>
