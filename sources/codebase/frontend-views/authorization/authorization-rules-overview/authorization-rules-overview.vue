<template>
    <div>
        <yim-page-overview
            :title="$t('User rights')"
            text=""></yim-page-overview>

        <yim-table-settings
            v-show="false"
            :columns="columns"
            :grid-data="authorizationRules"
            :default-hidden-columns="defaultHiddenColumns"
            :default-columns="defaultColumns"
            @filter-columns="kendoFilterColumns">
        </yim-table-settings>

        <table-wrapper>
            <template #table>
                <yim-table-filter>
                    <template #right>
                        <yim-filter-input
                            :button-text="$t('Search')"
                            :placeholder="$t('Search')"
                            data-cy="button-search"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-filter-input>
                    </template>
                </yim-table-filter>

                <kendo-grid
                    :data-items="authorizationRules"
                    :columns="columns"
                    :skip="skip"
                    :page-size="pageSize"
                    :pageable="getPageOptions"
                    :total="rulesCount"
                    class="k-grid k-grid--clickable"
                    :sortable="true"
                    :filterable="true"
                    scrollable="none"
                    @sortchange="onKendoSortChange"
                    @pagechange="onPageChange">
                    <template #processDefinitionTypesSlot="{props}">
                        <td>
                            {{ formatProcessDefinitionTypes(props.dataItem.processDefinitionTypes) }}
                        </td>
                    </template>
                    <template #registrationActionTypesSlot="{props}">
                        <td>
                            {{ formatRegistrationActionTypes(props.dataItem.registrationActionTypes) }}
                        </td>
                    </template>
                    <template #authorizationRuleActions="{props}">
                        <td class="k-grid__column-actions">
                            <icon-edit :controls-action="true" data-cy="button-edit" @click.native="$router.push(`/authorization/update-authorization-rule/${props.dataItem.authorizationRuleId}`)"></icon-edit>
                            <icon-trash :controls-action="true" data-cy="button-delete" @click.native="setAuthorizationRuleToDelete(props.dataItem.authorizationRuleId)"></icon-trash>
                        </td>
                    </template>
                    <template #filterSlotInput="{props}">
                        <yim-compact-filter-input
                            :placeholder="$t('Search')"
                            :query-value="props.field"
                            @onYimFilterChange="onYimFilterChange($event)">
                        </yim-compact-filter-input>
                    </template>
                </kendo-grid>
            </template>
            <template #actions>
                <actions :title="$t('My actions')">
                    <action
                        :title="$t('Create user right')"
                        @click.native="$router.push('/authorization-rule/new')"></action>
                    <action :help="true"></action>
                </actions>
            </template>
        </table-wrapper>

        <confirm-modal
            :show-modal="!!authorizationRuleToDelete.length"
            :title="$t('Confirmation')"
            :text="$t('Remove {name} \'{value}\' permanently? This action is irreversible.', { name: $t('User right').toLowerCase(), value: getRuleName(authorizationRuleToDelete)})"
            :save-text="$t('Remove')"
            @hide-modal="authorizationRuleToDelete = ''"
            @confirm-action="deleteAuthorizationRule"></confirm-modal>
    </div>
</template>

<script lang="ts" src="./authorization-rules-overview.ts"></script>
