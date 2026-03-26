<template>
    <div>
        <yim-detail-header
            :back-url="backUrl"
            :is-overview="true">
            <yim-detail-header-intro :title="authorization.name" :description="description"></yim-detail-header-intro>

            <yim-action-buttons
                data-cy="button-actions"
                :title="$t('Download')">
                <template #icon>
                    <span class="k-icon k-font-icon k-i-export button__icon"></span>
                </template>
                <yim-action-button :label="hasPersonsSelected() ? $t('SaveSelectionAsExcel') : $t('SaveAsExcel')" @action-click="downloadExcel"></yim-action-button>
                <yim-action-button :label="hasPersonsSelected() ? $t('SaveSelectionAsCSV') : $t('SaveAsCSV')" @action-click="downloadCsv"></yim-action-button>
            </yim-action-buttons>

            <yim-action-buttons data-cy="button-actions" :title="$t('Actions')">
                <template #icon>
                    <span class="k-icon k-font-icon k-i-gear button__icon"></span>
                </template>
                <yim-action-button v-if="hasPersonsSelected()" :label="$t('ExtendSelectionsDate')" @action-click="showChangeDateModal = true"></yim-action-button>
                <yim-action-button v-if="hasPersonsSelected()" :label="$t('RemovePersons')" @action-click="showConfirmModal = true"></yim-action-button>
                <yim-action-button v-if="!hasPersonsSelected()" :label="$t('ExtendDateSelectAll')" @action-click="onToggleExtendDateSelectAll()"></yim-action-button>
                <yim-action-button :label="$t('AddPerson')" @action-click="$router.push(newAuthorizationAccessUrl)"></yim-action-button>
            </yim-action-buttons>

            <yim-table-settings
                :columns="columns"
                :grid-data="authorizationMembers"
                :default-hidden-columns="defaultHiddenColumns"
                :default-columns="defaultColumns"
                @filter-columns="kendoFilterColumns"
                @reset-column-order="setDefaultColumns">
            </yim-table-settings>
        </yim-detail-header>

        <kendo-grid
            :data-items="authorizationMembers"
            :columns="columns"
            class="k-grid"
            :skip="skip"
            :page-size="pageSize"
            :pageable="getPageOptions"
            :total="authorizationMembersCount"
            :sortable="{ mode: 'multiple' }"
            :sort="kendoSort"
            :reorderable="true"
            :filterable="true"
            :filter-cell-render="onKendoFilterRender"
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
            <template #filterSlotSelection="">
            </template>
            <template #filterSlotType>
                <yim-compact-filter-multiselect
                    :type-prop="personTypes.type"
                    :options="myPersonRoleTypes.map((type) => ({ id: type.toString(), name: getLocalizedPersonRoleTypeName(type) }))"
                    query-value="types"
                    :placeholder="$t('Filter')"
                    @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-multiselect>
            </template>
            <template #filterSlotState>
                <yim-compact-filter-multiselect
                    :type-prop="authorizationStates.state"
                    :options="[authorizationStates.upcoming, authorizationStates.active, authorizationStates.expired].map((state) => ({ id: state, name: getLocalizedAuthorizationStateName(state) }))"
                    query-value="states"
                    :placeholder="$t('Filter')"
                    @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-multiselect>
            </template>
            <template #authorizedFrom="{props}">
                <yim-compact-filter-dates
                    :placeholder="props.title"
                    :query-value="props.field"
                    :default-date="new Date()"
                    filter-name="authorizedFrom"
                    @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
            </template>
            <template #authorizedTo="{props}">
                <yim-compact-filter-dates
                    :placeholder="props.title"
                    :query-value="props.field"
                    :default-date="new Date()"
                    filter-name="authorizedTo"
                    @onYimFilterChange="onYimFilterChange($event)"></yim-compact-filter-dates>
            </template>
            <template #selection="{props}">
                <td>
                    <yim-check-box
                        v-if="props.dataItem.authorizationState !== authorizationState.Expired"
                        :is-checked="selectedPersonAuthorizationIds.includes(props.dataItem.personAuthorizationId)"
                        @change="onToggleCheckbox(props)">
                    </yim-check-box>
                </td>
            </template>
            <template #type="{props}">
                <td class="k-cell-number">
                    {{ getTypeName(props.dataItem.type) }}
                </td>
            </template>
            <template #authorized-from="{props}">
                <td>
                    {{ formatYimDate(props.dataItem.authorizedFrom) }}
                </td>
            </template>
            <template #authorized-to="{props}">
                <td>
                    {{ formatYimDate(props.dataItem.authorizedTo) }}
                </td>
            </template>
            <template #personPhoneNumber="{props}">
                <td class="k-cell-number">
                    <span v-if="props.dataItem.phoneNumber">{{ '+' + props.dataItem.phoneNumber.countryCode + ' ' + props.dataItem.phoneNumber.nationalNumber }}</span>
                </td>
            </template>
            <template #authorizationState="{props}">
                <td class="k-cell-number">
                    {{ getStateName(props.dataItem.authorizationState) }}
                </td>
            </template>
        </kendo-grid>

        <access-change-date
            :show="showChangeDateModal"
            :selected-person-authorizations="selectedPersonAuthorizations"
            :selected-all="extendDateSelectAll"
            @save="saveDates"
            @cancel="showChangeDateModal = false; extendDateSelectAll = false">
        </access-change-date>

        <confirm-modal
            :show-modal="showConfirmModal"
            :title="$t('Confirmation')"
            :text="$t('Remove {name} \'{value}\' permanently? This action is irreversible.', { name: $t('Authorization').toLowerCase(), value: $t('Persons')})"
            :save-text="$t('Remove')"
            :processing="isRemovingPersons"
            :processing-message="$t('RemovingPersons')"
            @hide-modal="showConfirmModal = false"
            @confirm-action="removeAuthorizations()">
        </confirm-modal>

        <confirm-modal
            :show-modal="showConfirmSelectAllModal"
            :title="$t('Confirmation')"
            :text="$t('AuthorizationAccessSelectAllConfirm')"
            :save-text="$t('Confirm')"
            @hide-modal="showConfirmSelectAllModal = false;"
            @confirm-action="saveSelectAllDates()">
        </confirm-modal>
    </div>
</template>

<script src="./authorization-access-detail.ts"></script>
