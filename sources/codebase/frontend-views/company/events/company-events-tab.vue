<template>
    <div>
        <table-wrapper>
            <template #table>
                <yim-table-settings
                    :columns="columns"
                    :grid-data="events"
                    :default-hidden-columns="defaultHiddenColumns"
                    :default-columns="defaultColumns"
                    @filter-columns="kendoFilterColumns"
                    @reset-column-order="setDefaultColumns">
                </yim-table-settings>
                <kendo-grid
                    :data-items="events"
                    :columns="columns"
                    :skip="skip"
                    :page-size="pageSize"
                    :pageable="getPageOptions"
                    :total="totalCount"
                    :sortable="{ mode: 'multiple' }"
                    :sort="kendoSort"
                    :filterable="true"
                    :filter-cell-render="onKendoFilterRender"
                    :reorderable="true"
                    @columnreorder="onKendoColumnReorder"
                    @sortchange="onKendoSortChange"
                    @pagechange="onPageChange">
                    <template #filterSlotInput="{props}">
                        <yim-compact-filter-input
                            :placeholder="$t('Search')"
                            :query-value="props.field"
                            @onYimFilterChange="onYimFilterChange($event)">
                        </yim-compact-filter-input>
                    </template>
                    <template #filterSlotEventType>
                        <yim-compact-filter-multiselect
                            v-if="eventTypeOptions"
                            type-prop="eventTypeId"
                            :options="eventTypeOptions"
                            query-value="eventType"
                            :placeholder="$t('Event type')"
                            @onYimFilterChange="onYimFilterChange($event)">
                        </yim-compact-filter-multiselect>
                    </template>
                </kendo-grid>
            </template>
        </table-wrapper>
    </div>
</template>

<script lang="ts" src="./company-events-tab.ts"></script>
