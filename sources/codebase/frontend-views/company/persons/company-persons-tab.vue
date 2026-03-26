<template>
    <div>
        <table-wrapper>
            <template #table>
                <yim-table-settings
                    :columns="columns"
                    :grid-data="rows"
                    :default-hidden-columns="defaultHiddenColumns"
                    :default-columns="defaultColumns"
                    @filter-columns="kendoFilterColumns"
                    @reset-column-order="setDefaultColumns">
                </yim-table-settings>
                <kendo-grid
                    :data-items="rows"
                    :columns="columns"
                    :skip="skip"
                    :page-size="pageSize"
                    :pageable="getPageOptions"
                    :total="totalCount"
                    class="k-grid--clickable"
                    :sortable="{ mode: 'multiple' }"
                    :sort="kendoSort"
                    :filterable="true"
                    :filter-cell-render="onKendoFilterRender"
                    :reorderable="true"
                    @columnreorder="onKendoColumnReorder"
                    @rowclick="onPersonClick"
                    @sortchange="onKendoSortChange"
                    @pagechange="onPageChange">
                    <template #filterSlotInput="{props}">
                        <yim-compact-filter-input
                            :placeholder="$t('Search')"
                            :query-value="props.field"
                            @onYimFilterChange="onYimFilterChange($event)">
                        </yim-compact-filter-input>
                    </template>
                    <template #filterSlotType>
                        <yim-compact-filter-multiselect
                            :type-prop="personTypes.type"
                            :options="myPersonRoleTypes.map((type) => ({ id: type.toString(), name: getLocalizedPersonRoleTypeName(type) }))"
                            query-value="type"
                            :placeholder="$t('Type')"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-multiselect>
                    </template>
                    <template #dateOfBirth="{props}">
                        <yim-compact-filter-dates
                            :placeholder="props.title"
                            :query-value="props.field"
                            :default-date="new Date()"
                            filter-name="dateOfBirth"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
                    </template>
                    <template #createdAt="{props}">
                        <yim-compact-filter-dates
                            :placeholder="props.title"
                            :query-value="props.field"
                            :default-date="new Date()"
                            filter-name="createdAt"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
                    </template>
                    <template #dossierLastModified="{props}">
                        <yim-compact-filter-dates
                            :placeholder="props.title"
                            :query-value="props.field"
                            :default-date="new Date()"
                            filter-name="dossierLastModified"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
                    </template>
                    <template #firstArrival="{props}">
                        <yim-compact-filter-dates
                            :placeholder="props.title"
                            :query-value="props.field"
                            :default-date="new Date()"
                            filter-name="firstArrival"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
                    </template>
                    <template #lastDeparture="{props}">
                        <yim-compact-filter-dates
                            :placeholder="props.title"
                            :query-value="props.field"
                            :default-date="new Date()"
                            filter-name="lastDeparture"
                            @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
                    </template>
                    <template #type="{props}">
                        <td class="k-cell-number">
                            {{ getLocalizedPersonRoleTypeName(props.dataItem.type) }}
                        </td>
                    </template>
                    <template #date-birth="{props}">
                        <td>
                            {{ formatYimDate(props.dataItem.dateOfBirth) }}
                        </td>
                    </template>
                    <template #dossier-last-modified="{props}">
                        <td>
                            {{ formatYimDate(props.dataItem.dossierLastModified) }}
                        </td>
                    </template>
                    <template #created-at="{props}">
                        <td>
                            {{ formatYimDate(props.dataItem.createdAt) }}
                        </td>
                    </template>
                    <template #first-arrival="{props}">
                        <td>
                            {{ formatYimDate(props.dataItem.firstArrival) }}
                        </td>
                    </template>
                    <template #last-departure="{props}">
                        <td>
                            {{ formatYimDate(props.dataItem.lastDeparture) }}
                        </td>
                    </template>
                    <template #personPhoneNumber="{props}">
                        <td class="k-cell-number">
                            <span v-if="props.dataItem.phoneNumber">{{
                                '+' + props.dataItem.phoneNumber.countryCode + ' ' + props.dataItem.phoneNumber.nationalNumber
                            }}</span>
                        </td>
                    </template>
                </kendo-grid>
            </template>

            <template v-if="registrationActionTypes.length" #actions>
                <actions :title="$t('My actions')">
                    <action
                        v-for="(registrationActionType, index) in registrationActionTypes"
                        :key="'processdefinition-' + index"
                        :title="registrationActionType.name"
                        :description="registrationActionType.description"
                        @click.native="onRegistrationClick(registrationActionType.processId)">
                    </action>
                    <action :help="true"></action>
                </actions>
            </template>
        </table-wrapper>
    </div>
</template>

<script lang="ts" src="./company-persons-tab.ts"></script>
