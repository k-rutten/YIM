<template>
    <Form ref="validationObserver" v-slot="{errors}">
        <yim-404
            v-if="authorizationFound === false">
        </yim-404>
        <div
            v-else-if="authorizationFound === true">
            <yim-sidebar :header="$t('Update access rule')">
                <yim-sidebar-steps>
                    <yim-sidebar-step :is-active="true" :is-complete="true">
                        {{ $t('Access') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Registrations') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Notifications') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('AEOS connection') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('IloqConnection') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('SALTO connection') }}
                    </yim-sidebar-step>
                </yim-sidebar-steps>
            </yim-sidebar>

            <form-steps :has-management-sidebar-detail-form="true">
                <form-step>
                    <form-step-header :number="1">
                        <form-step-intro :title="$t('Access rule')"></form-step-intro>
                    </form-step-header>
                    <form-step-rows>
                        <form-step-row>
                            <form-step-items :title="$t('Access')">
                                <form-step-item>
                                    <form-field-text
                                        v-model="form.name"
                                        name="name"
                                        type="text"
                                        rules="required"
                                        data-cy="form-field-text-name"
                                        :label="$t('Name')"></form-field-text>
                                </form-step-item>

                                <form-step-item>
                                    <yim-multi-select-picker
                                        :data-source="yimAssets"
                                        :total-items="yimAssets.length"
                                        :selected-items="selectedYimAssets"
                                        :label="$t('YIM Assets')"
                                        :is-optional="true"
                                        :disabled-message="!form.dateTimeScheduleId ? $t('SelectDateTimeScheduleFirstForYimAssets') : null"
                                        name="yimAssets"
                                        data-cy="form-field-select-yim-assets"
                                        @search-items="onYimAssetsWithZoneAndLocationSearch($event)"
                                        @items-updated="onYimAssetsWithZoneAndLocationSelectItems($event)">
                                    </yim-multi-select-picker>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.locationIds"
                                        rules="required"
                                        name="locationId"
                                        :label="$t('Location')"
                                        :no-data-template-message="$t('No locations found')"
                                        :data-source="locations ? locations: []"
                                        text-field="name"
                                        data-cy="form-field-select-location"
                                        value-field="locationId">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-select
                                        v-model="form.dateTimeScheduleId"
                                        rules="required"
                                        name="dateTimeScheduleId"
                                        :label="$t('Date time schedule')"
                                        :no-data-template-message="$t('No date time schedules found')"
                                        :data-source="filteredDateTimeSchedules"
                                        text-field="name"
                                        data-cy="form-field-select-date-time-schedule"
                                        :value-field="'dateTimeScheduleId'">
                                    </form-field-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-multi-select
                                        v-model="form.zones"
                                        :data-source="zones"
                                        name="zones"
                                        :label="$t('Zones')"
                                        text-field="name"
                                        value-field="zoneId"
                                        rules="required"
                                        data-cy="form-field-multi-select-zones"
                                        :placeholder="$t('Select zones')">
                                    </form-field-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.authorizationTypes"
                                        :data-source="authorizationTypeDataSource"
                                        name="authorizationTypes"
                                        :label="$t('Authorization types')"
                                        text-field="text"
                                        value-field="value"
                                        :placeholder="$t('Select authorization types')"
                                        data-cy="form-field-left-to-right-multi-select-authorization-types">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                                <form-step-item v-if="authorizationTypeIsParkingLot">
                                    <form-field-text
                                        v-model="form.description"
                                        name="parkingLotDescription"
                                        type="textarea"
                                        data-cy="form-field-text-description"
                                        :label="$t('ParkingLotDescription')"></form-field-text>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Registrations')">
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.processDefinitionTypes"
                                        :data-source="processDefinitionTypeDataSource"
                                        name="processDefinitionTypes"
                                        :label="$t('Process definitions')"
                                        text-field="text"
                                        value-field="value"
                                        rules="required"
                                        data-cy="form-field-left-to-right-multi-select-process-definitions"
                                        :placeholder="$t('Select process definitions')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.contractorTypes"
                                        :data-source="contractorTypes"
                                        name="contractorTypes"
                                        text-field="name"
                                        value-field="id"
                                        :label="$t('ContractorTypes')"
                                        data-cy="form-field-left-to-right-multi-select-contractor-types"
                                        :placeholder="$t('SelectContractorTypes')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-yes-no
                                        v-model="form.disableAccreditation"
                                        :rules="{ disableAccreditationRule, required: true }"
                                        name="disableAccreditation"
                                        :inverted="true"
                                        data-cy="form-field-yes-no-disable-accreditation"
                                        :label="hasTenantTwoStepAccreditationEnabled ? $t('Other accreditation') : $t('Requires accreditation')"></form-field-yes-no>
                                </form-step-item>

                                <form-step-item v-if="hasTenantTwoStepAccreditationEnabled">
                                    <form-field-buttons-toggle
                                        v-model="form.employeeAccreditationType"
                                        :rules="{ employeeAccreditationTypeRule }"
                                        :options="authorizationAccreditationTypeOptions"
                                        name="employeeAccreditationType"
                                        validation-label="employeeAccreditationType"
                                        data-cy="form-field-yes-no-disable-selectedEmployeeAccreditationType"
                                        :label="$t('Employee accreditation')">
                                    </form-field-buttons-toggle>
                                </form-step-item>

                                <form-step-item v-if="enableEmployeeProcessAccreditorDropdowns">
                                    <form-field-select
                                        v-model="form.firstStepAccreditorType"
                                        :rules="{
                                            required: true,
                                            notEqualsTo: [form.secondStepAccreditorType, 'Second accreditor'],
                                        }"
                                        name="firstStepAccreditorType"
                                        :label="$t('First accreditor')"
                                        :data-source="accreditorGroupTypeOptions"
                                        text-field="name"
                                        data-cy="form-field-select-first-accreditor"
                                        value-field="value">
                                    </form-field-select>

                                    <help-tooltip-component :text="$t('HelpTextAccreditorSelectionManager')"></help-tooltip-component>
                                </form-step-item>
                                <form-step-item v-if="enableEmployeeProcessAccreditorDropdowns">
                                    <form-field-select
                                        v-model="form.secondStepAccreditorType"
                                        :rules="{
                                            required: true,
                                            notEqualsTo: [form.firstStepAccreditorType, 'First accreditor'],
                                        }"
                                        name="secondStepAccreditorType"
                                        :label="$t('Second accreditor')"
                                        :data-source="accreditorGroupTypeOptions"
                                        text-field="name"
                                        data-cy="form-field-select-second-accreditor"
                                        value-field="value">
                                    </form-field-select>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Notifications')">
                                <form-step-item>
                                    <form-field-yes-no
                                        v-model="form.sendNotification"
                                        :rules="'required'"
                                        name="sendNotification"
                                        data-cy="form-field-yes-no-send-notification"
                                        :label="$t('SendNotification')">
                                    </form-field-yes-no>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row
                            v-if="hasAeosConnector">
                            <form-step-items :title="$t('AEOS connection')">
                                <form-step-item>
                                    <form-field-buttons-toggle
                                        v-model="selectedAeosMapOption"
                                        name="selectedAeosMapOption"
                                        :label="$t('AEOS authorization')"
                                        :options="aeosMapOptions"
                                        data-cy="form-field-buttons-toggle-aeos-map"
                                        @input="setSelectedAeosMapOption($event)"></form-field-buttons-toggle>
                                </form-step-item>

                                <form-step-item
                                    v-if="selectedAeosMapOption.value === 1">
                                    <aeos-picker
                                        rules="required"
                                        :already-selected="selectedAeosTemplate"
                                        variant="AEOS template"
                                        @selected-item-changed="aeosTemplateChanged($event)">
                                    </aeos-picker>
                                </form-step-item>

                                <form-step-item
                                    v-else-if="selectedAeosMapOption.value === 2">
                                    <aeos-picker
                                        rules="required"
                                        :already-selected="selectedAeosAccess"
                                        variant="AEOS access"
                                        @selected-item-changed="aeosAccessChanged($event)">
                                    </aeos-picker>
                                    <aeos-picker
                                        rules="required"
                                        :already-selected="selectedAeosDayTimeSchedule"
                                        :name="$t('AEOS day time schedule')"
                                        variant="AEOS day time schedule"
                                        @selected-item-changed="aeosDateTimeScheduleChanged($event)">
                                    </aeos-picker>
                                </form-step-item>

                                <form-step-item
                                    v-else-if="selectedAeosMapOption.value === 3">
                                    <aeos-picker
                                        :name="$t('AEOS access group')"
                                        rules="required"
                                        :already-selected="selectedAeosAccessGroup"
                                        variant="AEOS access group"
                                        @selected-item-changed="aeosAccessGroupChanged($event)">
                                    </aeos-picker>
                                    <aeos-picker
                                        rules="required"
                                        :already-selected="selectedAeosDayTimeSchedule"
                                        :name="$t('AEOS day time schedule')"
                                        variant="AEOS day time schedule"
                                        @selected-item-changed="aeosDateTimeScheduleChanged($event)">
                                    </aeos-picker>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row
                            v-if="hasIloqAccessControlSystem">
                            <form-step-items :title="$t('IloqConnection')">
                                <form-step-item>
                                    <form-field-buttons-toggle
                                        v-model="selectedIloqMapOption"
                                        name="selectedIloqMapOption"
                                        :label="$t('IloqAuthorization')"
                                        :options="iloqMapOptions"
                                        data-cy="form-field-buttons-toggle-iloq-map"
                                        @input="setSelectedIloqMapOption($event)"></form-field-buttons-toggle>
                                </form-step-item>

                                <form-step-item
                                    v-if="selectedIloqMapOption.value === 3">
                                    <iloq-picker
                                        rules="required"
                                        :already-selected="selectedIloqAccessGroup"
                                        variant="iLOQ access group"
                                        @selected-item-changed="iloqAccessGroupChanged($event)">
                                    </iloq-picker>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row
                            v-if="hasSaltoConnector">
                            <form-step-items :title="$t('SALTO connection')">
                                <form-step-item>
                                    <form-field-buttons-toggle
                                        v-model="selectedSaltoMapOption"
                                        name="selectedSaltoMapOption"
                                        :label="$t('SALTO authorization')"
                                        :options="saltoMapOptions"
                                        data-cy="form-field-buttons-toggle-salto-map"
                                        @input="setSelectedSaltoMapOption($event)"></form-field-buttons-toggle>
                                </form-step-item>

                                <form-step-item
                                    v-if="selectedSaltoMapOption.value === 1">
                                    <salto-picker
                                        rules="required"
                                        :already-selected="selectedSaltoTemplate"
                                        variant="SALTO template"
                                        @selected-item-changed="saltoTemplateChanged($event)">
                                    </salto-picker>
                                </form-step-item>

                                <form-step-item v-else-if="selectedSaltoMapOption.value === 2">
                                    <salto-picker
                                        rules="required"
                                        :already-selected="selectedSaltoAccess"
                                        variant="SALTO access"
                                        @selected-item-changed="saltoAccessChanged($event)">
                                    </salto-picker>
                                    <salto-picker
                                        rules="required"
                                        :already-selected="selectedSaltoDayTimeSchedule"
                                        :name="$t('SALTO day time schedule')"
                                        variant="SALTO day time schedule"
                                        @selected-item-changed="saltoDateTimeScheduleChanged($event)">
                                    </salto-picker>
                                </form-step-item>

                                <form-step-item v-else-if="selectedSaltoMapOption.value === 3">
                                    <salto-picker
                                        rules="required"
                                        :already-selected="selectedSaltoAccessGroup"
                                        :name="$t('SALTO access group')"
                                        variant="SALTO access group"
                                        @selected-item-changed="saltoAccessGroupChanged($event)">
                                    </salto-picker>
                                    <salto-picker
                                        rules="required"
                                        :already-selected="selectedSaltoDayTimeSchedule"
                                        :name="$t('SALTO day time schedule')"
                                        variant="SALTO day time schedule"
                                        @selected-item-changed="saltoDateTimeScheduleChanged($event)">
                                    </salto-picker>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>
                    </form-step-rows>
                </form-step>
            </form-steps>

            <yim-form-controls>
                <yim-form-control
                    :back="true"
                    type="text"
                    button-cy="button-back"
                    @click.native="$router.push('/management/authorization/overview')">
                    {{ $t('Back') }}
                </yim-form-control>

                <template #messages>
                    <yim-form-message
                        v-if="errors"
                        :errors="errors">
                    </yim-form-message>
                </template>

                <yim-form-control
                    button-cy="button-save"
                    :disabled="actionButtonIsDisabled"
                    @click.native="updateAuthorization">
                    {{ $t('Save') }}
                </yim-form-control>
            </yim-form-controls>
        </div>
    </Form>
</template>

<script lang="ts" src="./update-authorization.ts"></script>
