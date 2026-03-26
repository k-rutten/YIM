<template>
    <Form
        v-slot="{ errors }"
        ref="validationObserver"
        as="div">
        <yim-404 v-if="authorizationRuleFound === false"></yim-404>
        <div v-else>
            <yim-sidebar :header="$t('Edit user right')">
                <yim-sidebar-steps>
                    <yim-sidebar-step>
                        {{ $t('Information') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Processrights') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Views') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Reports') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Permissions') }}
                    </yim-sidebar-step>
                    <yim-sidebar-step>
                        {{ $t('Companies') }}
                    </yim-sidebar-step>
                </yim-sidebar-steps>
            </yim-sidebar>

            <form-steps :has-management-sidebar-detail-form="true">
                <form-step v-if="hasInitialData === null">
                    {{ $t('LoadingData') }}
                </form-step>
                <form-step v-else-if="hasInitialData === true && authorizationRuleFound === true">
                    <form-step-header :number="1">
                        <form-step-intro :title="$t('User right')"></form-step-intro>
                    </form-step-header>

                    <form-step-rows>
                        <form-step-row>
                            <form-step-items :title="$t('Information')">
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
                                    <form-field-text
                                        v-model="form.description"
                                        name="description"
                                        type="text"
                                        rules="required"
                                        data-cy="form-field-text-description"
                                        :label="$t('Description')"></form-field-text>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Processrights')">
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.processDefinitionTypes"
                                        :data-source="processDefinitionTypeDataSource"
                                        name="processDefinitionTypes"
                                        text-field="text"
                                        value-field="value"
                                        :label="$t('Process definitions')"
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
                                    <form-field-left-to-right-multi-select
                                        v-model="form.registrationActionTypes"
                                        :data-source="registrationActionTypesDataSource"
                                        name="registrationActionTypes"
                                        text-field="text"
                                        value-field="value"
                                        :label="$t('Tasks')"
                                        data-cy="form-field-left-to-right-multi-select-tasks"
                                        :placeholder="$t('Select tasks')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-select
                                        v-model="form.companyAccessLevel"
                                        name="companyAccessLevel"
                                        :label="$t('Level')"
                                        :no-data-template-message="$t('No levels found')"
                                        :data-source="companyAccessLevelDataSource"
                                        text-field="text"
                                        data-cy="form-field-select-access-level"
                                        value-field="value">
                                    </form-field-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.dossierAccessLevels"
                                        :data-source="dossierAccessLevelDataSource"
                                        name="dossierAccessLevels"
                                        text-field="text"
                                        value-field="value"
                                        :label="$t('Dossier levels')"
                                        data-cy="form-field-left-to-right-multi-select-dossier-levels"
                                        :placeholder="$t('Select dossier levels')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.fileAccessLevels"
                                        :data-source="fileAccessLevelsDataSource"
                                        name="fileAccessLevels"
                                        text-field="text"
                                        value-field="value"
                                        :label="$t('File access')"
                                        data-cy="form-field-left-to-right-multi-select-file-access-levels"
                                        :placeholder="$t('Select file access')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.locations"
                                        :data-source="locations"
                                        name="locations"
                                        text-field="name"
                                        value-field="locationId"
                                        :label="$t('Locations')"
                                        :placeholder="$t('Select locations')"
                                        data-cy="form-field-left-to-right-multi-select-locations"
                                        :rules="{ required: requireAuthorizationTags() }">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.dateTimeSchedules"
                                        :data-source="dateTimeSchedules"
                                        name="dateTimeSchedules"
                                        text-field="name"
                                        value-field="dateTimeScheduleId"
                                        :label="$t('Date time schedules')"
                                        :placeholder="$t('Select date time schedules')"
                                        data-cy="form-field-left-to-right-multi-select-date-time-schedules"
                                        :rules="{ required: requireAuthorizationTags() }">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>

                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.zones"
                                        :data-source="zones"
                                        name="zones"
                                        text-field="name"
                                        value-field="zoneId"
                                        :label="$t('Zones')"
                                        :placeholder="$t('Select zones')"
                                        data-cy="form-field-left-to-right-multi-select-zones"
                                        :rules="{ required: requireAuthorizationTags() }">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Views')">
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="selectedViews"
                                        :data-source="views"
                                        name="views"
                                        text-field="name"
                                        value-field="permission"
                                        data-cy="form-field-left-to-right-multi-select-views"
                                        :label="$t('Views')"
                                        :placeholder="$t('Select view')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Reports')">
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="form.reports"
                                        :data-source="reports"
                                        name="reports"
                                        text-field="name"
                                        value-field="reportId"
                                        data-cy="form-field-left-to-right-multi-select-reports"
                                        :label="$t('Reports')"
                                        :placeholder="$t('Select reports')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="selectedReports"
                                        :data-source="legacyReports"
                                        name="legacyReports"
                                        text-field="name"
                                        value-field="permission"
                                        data-cy="form-field-left-to-right-multi-select-legacy-reports"
                                        :label="$t('LegacyReports')"
                                        :placeholder="$t('SelectLegacyReports')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Permissions')">
                                <form-step-item>
                                    <form-field-left-to-right-multi-select
                                        v-model="selectedPermissions"
                                        :data-source="permissions"
                                        name="permissions"
                                        text-field="name"
                                        value-field="permission"
                                        data-cy="form-field-left-to-right-multi-select-permissions"
                                        :label="$t('Permissions')"
                                        :placeholder="$t('Select permission')">
                                    </form-field-left-to-right-multi-select>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row v-if="hasRoleDelegationEnabled">
                            <form-step-items :title="$t('Delegation')">
                                <form-step-item>
                                    <form-field-yes-no
                                        v-model="form.allowRoleDelegation"
                                        name="allowRoleDelegation"
                                        :rules="'required'"
                                        data-cy="form-field-yes-no-allow-role-delegation"
                                        :label="$t('AllowRoleDelegation')"></form-field-yes-no>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row>
                            <form-step-items :title="$t('Companies')">
                                <form-step-item>
                                    <form-field-yes-no
                                        v-model="form.accreditAllCompanies"
                                        name="accreditAllCompanies"
                                        :rules="'required'"
                                        data-cy="form-field-yes-no-accredit-all-companies"
                                        :label="$t('AccreditAllCompanies')"></form-field-yes-no>
                                </form-step-item>
                                <form-step-item v-if="!form.accreditAllCompanies">
                                    <yim-multi-picker-button
                                        :label="$t('Select companies')"
                                        :disabled="false"
                                        :selected-items="selectedCompanies"
                                        @open-modal="openCompanies"
                                        @remove-item="removeCompany">
                                        <portal to="application-modals">
                                            <yim-select-modal
                                                :show="showPickerModal"
                                                :default-selected-items="selectedCompanies"
                                                :data-source="companies"
                                                :label="$t('Companies')"
                                                :label-search="$t('Search companies')"
                                                :label-selected="$t('Selected companies')"
                                                :loading="actionButtonIsDisabled"
                                                :allow-multiple-items="true"
                                                :total-items="totalCompanies"
                                                @selected-items="selectCompany"
                                                @search-items="findCompanies"
                                                @close="showPickerModal = false"></yim-select-modal>
                                        </portal>
                                    </yim-multi-picker-button>
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
                    data-cy="button-go-back"
                    @click.native="goBack()">
                    {{ $t('Back') }}
                </yim-form-control>

                <template #messages>
                    <yim-form-message
                        v-if="errors"
                        :errors="errors">
                    </yim-form-message>
                </template>

                <yim-form-control
                    v-if="hasInitialData === true && authorizationRuleFound === true"
                    data-cy="button-save"
                    :disabled="actionButtonIsDisabled"
                    @click.native="updateAuthorizationRule">
                    {{ $t('Save') }}
                </yim-form-control>
            </yim-form-controls>
        </div>
    </Form>
</template>

<script lang="ts" src="./update-authorization-rule.ts"></script>
