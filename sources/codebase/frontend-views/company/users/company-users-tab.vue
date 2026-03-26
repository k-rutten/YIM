<template>
    <div>
        <table-wrapper>
            <template #table>
                <yim-table-settings
                    :columns="columns"
                    :default-hidden-columns="defaultHiddenColumns"
                    :default-columns="defaultColumns"
                    @filter-columns="kendoFilterColumns">
                </yim-table-settings>
                <kendo-grid
                    :data-items="rows"
                    :columns="columns"
                    :skip="skip"
                    :page-size="pageSize"
                    :pageable="getPageOptions"
                    :total="totalCount"
                    class="k-grid"
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
                </kendo-grid>
            </template>
        </table-wrapper>
    </div>
</template>

<script lang="ts" src="./company-users-tab.ts"></script>
