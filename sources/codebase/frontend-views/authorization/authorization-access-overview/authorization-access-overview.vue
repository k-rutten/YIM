<template>
    <div>
        <yim-page-overview
            :title="$t('Authorization access')"
            text=""></yim-page-overview>

        <yim-table-settings
            :columns="columns"
            :grid-data="authorizations"
            :default-hidden-columns="defaultHiddenColumns"
            @filter-columns="kendoFilterColumns">
        </yim-table-settings>

        <kendo-grid
            :data-items="authorizations"
            :columns="columns"
            :skip="skip"
            :page-size="pageSize"
            :pageable="getPageOptions"
            :total="authorizationsCount"
            class="k-grid k-grid--clickable"
            :sortable="{ mode: 'multiple' }"
            :sort="kendoSort"
            :reorderable="true"
            :filterable="true"
            :filter-cell-render="onKendoFilterRender"
            @rowclick="onRowClick"
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
            <template #filterSlotLocations>
                <yim-compact-filter-multiselect-locations
                    type-prop="locationId"
                    query-value="location"
                    @onYimFilterChange="onYimFilterChange($event)">
                </yim-compact-filter-multiselect-locations>
            </template>
            <template #filterSlotZones>
                <yim-compact-filter-multiselect
                    v-if="zoneOptions"
                    :options="zoneOptions"
                    query-value="zones"
                    :placeholder="$t('Zones')"
                    type-prop="zoneId"
                    @onYimFilterChange="onYimFilterChange($event)">
                </yim-compact-filter-multiselect>
            </template>
            <template #filterSlotDateTimeSchedules>
                <yim-compact-filter-multiselect
                    v-if="dateTimeScheduleOptions"
                    :options="dateTimeScheduleOptions"
                    query-value="dateTimeSchedules"
                    :placeholder="$t('DateTimeSchedules')"
                    type-prop="dateTimeScheduleId"
                    @onYimFilterChange="onYimFilterChange($event)">
                </yim-compact-filter-multiselect>
            </template>
            <template #filterSlotAuthorizationType>
                <yim-compact-filter-multiselect
                    v-if="processDefinitionScheduleOptions"
                    :options="processDefinitionScheduleOptions"
                    query-value="processDefinitionTypes"
                    :placeholder="$t('Process')"
                    type-prop="id"
                    @onYimFilterChange="onYimFilterChange($event)">
                </yim-compact-filter-multiselect>
            </template>
            <template #filterSlotArchiveState>
                <yim-compact-filter-multiselect
                    type-prop="type"
                    :options="[archiveStates.active, archiveStates.archived].map((archiveStates) => ({ id: archiveStates, name: getLocalizedArchiveStateName(archiveStates) }))"
                    query-value="archiveStates"
                    :placeholder="$t('State')"
                    @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-multiselect>
            </template>
            <template #archive-state="{props}">
                <td>
                    <div class="overview-wrapper__status">
                        <span :class="['overview-wrapper__status-icon', `overview-wrapper__status-icon--${getStateClassModifier(props.dataItem.state)}`]"></span>
                        <span class="overview-wrapper__status-text">{{ getStateName(props.dataItem.state) }}</span>
                    </div>
                </td>
            </template>
            <template #location-tag="{props}">
                <td>
                    {{ formatLocations(props.dataItem.locations.map((location) => location.name)) }}
                </td>
            </template>
            <template #dateTimeSchedule-tag="{props}">
                <td>
                    {{ props.dataItem.dateTimeSchedule.name }}
                </td>
            </template>
            <template #zones-tag="{props}">
                <td>
                    <span v-for="(zone, index) in props.dataItem.zones" :key="index">
                        <span>{{ zone.name }}<template v-if="index < props.dataItem.zones.length - 1">, </template></span>
                    </span>
                </td>
            </template>
            <template #type="{props}">
                <td>
                    <span v-for="(type, index) in props.dataItem.processDefinitionTypes" :key="index">
                        <span>{{ getTypeName(type) }}<template v-if="index < props.dataItem.processDefinitionTypes.length - 1">, </template></span>
                    </span>
                </td>
            </template>
        </kendo-grid>
    </div>
</template>

<script lang="ts" src="./authorization-access-overview.ts"></script>
