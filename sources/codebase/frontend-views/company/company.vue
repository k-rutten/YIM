<template>
    <div>
        <tab-page-wrapper v-if="entityFound !== null">
            <template #header>
                <yim-backdrop></yim-backdrop>

                <yim-detail-header :back-url="companiesUrl">
                    <yim-detail-header-intro
                        :title="company?.name || ''"
                        :description="description"
                        :text="$t('Last updated on {0}', [formattedModificationDate])">

                        <template #extra>
                            <yim-chip
                                :text="(company?.state.value === companyStateInactive) ? $t('Inactive') : $t('Active')"
                                :inactive="company?.state.value === companyStateInactive">
                            </yim-chip>
                        </template>
                    </yim-detail-header-intro>
                </yim-detail-header>

                <yim-tab-bar :links="links"></yim-tab-bar>
            </template>

            <template #content>
                <router-view></router-view>
            </template>
        </tab-page-wrapper>
        <yim-404 v-if="entityFound === false"></yim-404>
    </div>
</template>

<script lang="ts" src="./company.ts"></script>
