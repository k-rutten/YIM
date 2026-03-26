<template>
    <div class="overview-wrapper__container--has-management-sidebar">
        <div class="overview-wrapper__content">
            <yim-page-overview
                :title="$t('Companies')"
                text=""></yim-page-overview>

            <yim-table-filter>
                <template #left>
                    <yim-filter-buttons
                        query-value="filter"
                        :type-prop="companyFilters.type"
                        :active-filter-prop="$route.query.filter ? $route.query.filter : 'All'"
                        :options="companyFilters.asArray.map((filter) => ({ id: filter, name: getLocalizedCompanyFilterName(filter) }))"
                        @onYimFilterChange="onYimFilterChange($event)"></yim-filter-buttons>
                </template>
                <template #right>
                    <yim-filter-input
                        :button-text="$t('Search')"
                        :placeholder="$t('Search')"
                        :max="max"
                        @onYimFilterChange="onYimFilterChange($event)"></yim-filter-input>

                    <yim-table-settings
                        :columns="columns"
                        :grid-data="rows"
                        :default-columns="defaultColumns"
                        :default-hidden-columns="defaultHiddenColumns"
                        @filter-columns="kendoFilterColumns"
                        @reset-column-order="setDefaultColumns">
                    </yim-table-settings>
                </template>
            </yim-table-filter>

            <kendo-grid
                :data-items="rows"
                :columns="columns"
                :skip="skip"
                :page-size="pageSize"
                :pageable="getPageOptions"
                :total="companiesCount"
                class="k-grid--clickable"
                :sortable="{ mode: 'multiple' }"
                @columnreorder="onKendoColumnReorder"
                @rowclick="onCompanyClick"
                @sortchange="onKendoSortChange"
                @pagechange="onPageChange">

                <template #companyName="{ props }">
                    <td>
                        {{ props.dataItem.name }}
                    </td>
                </template>

                <template #location="{ props }">
                    <td>
                        <template v-if="props.dataItem.address">
                            {{ props.dataItem.address.locality }}, {{ props.dataItem.country }}
                        </template>
                    </td>
                </template>

                <template #deactivateOnUtc="{ props }">
                    <td>
                        {{ formatYimDate(props.dataItem.deactivateOnUtc) }}
                    </td>
                </template>

                <template #companyState="{ props }">
                    <td>
                        <yim-status-indicator
                            :state="getCompanyStateClassModifier(props.dataItem.state.value)">
                            {{ props.dataItem.state.label }}
                        </yim-status-indicator>
                    </td>
                </template>
            </kendo-grid>
        </div>

        <div class="overview-wrapper__actions">
            <actions :title="$t('My actions')">
                <action
                    v-for="(registrationActionType, index) in registrationActionTypes"
                    :key="'processdefinition-' + index"
                    class="dashboard__action"
                    :title="$t(registrationActionType.name)"
                    :description="$t(registrationActionType.description)"
                    @click.native="onRegistrationClick(registrationActionType.processId)">
                </action>
                <action :help="true"></action>
            </actions>
        </div>
    </div>
</template>

<script lang="ts" src="./company-overview.ts"></script>
