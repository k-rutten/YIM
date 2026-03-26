<template>
    <div class="person__content--sidebar">
        <yim-table
            v-if="registrations"
            :data="registrations"
            class="person__details"
            @onRowClick="onRegistrationClick">
            <template #default="entry">
                <yim-table-column
                    :label="$t('Type')"
                    :value="$t(entry.entry.processName)">
                </yim-table-column>
                <yim-table-column>
                    <span class="yim-table__context">{{ $t('Location') }}</span>
                    <div v-if="entry.entry.processType === processDefinitionType.CompanyRegistration">
                        {{ $t('n/a') }}
                    </div>
                    <template v-else>
                        <span
                            v-for="(n, index) in Math.min(entry.entry.authorizationCount, 3)"
                            :key="index"
                            class="yim-table__location-icon"></span>
                        <div :class="{ 'yim-table__location-name': true, 'yim-table__location-name--has-authorizations': entry.entry.authorizationCount }">
                            {{ $t('{count} locations', entry.entry.authorizationCount) }}
                        </div>
                    </template>
                </yim-table-column>
                <yim-table-column
                    :label="$t('Arrival')"
                    :value="formatYimDate(entry.entry.arrivalDate)">
                </yim-table-column>
                <yim-table-column
                    :label="$t('Result dossier')"
                    :value="entry.entry.dossierAccreditationState.label">
                </yim-table-column>
                <yim-table-column>
                    <span class="yim-table__context">{{ getAuthorizationTitle(entry.entry) }}</span>
                    <div v-if="hasAuthorizationsStepOne(entry.entry)" class="yim-table__info">
                        {{ $t('{count} approved', entry.entry.authorizationAccreditationStateStepOne.approvedCount) }} /
                        {{ $t('{count} rejected', entry.entry.authorizationAccreditationStateStepOne.rejectedCount) }}
                    </div>
                    <div v-else class="yim-table__info">
                        -
                    </div>
                </yim-table-column>
                <yim-table-column v-if="twoStepAccreditationColumnEnabled(entry.entry)">
                    <span class="yim-table__context">{{ $t('ResultAuthorizationStepTwo') }}</span>
                    <div v-if="hasAuthorizationsStepTwo(entry.entry)" class="yim-table__info">
                        {{ $t('{count} approved', entry.entry.authorizationAccreditationStateStepTwo.approvedCount) }} /
                        {{ $t('{count} rejected', entry.entry.authorizationAccreditationStateStepTwo.rejectedCount) }}
                    </div>
                    <div v-else class="yim-table__info">
                        -
                    </div>
                </yim-table-column>
                <yim-table-column>
                    <div class="overview-wrapper__status">
                        <span :class="['overview-wrapper__status-icon', `overview-wrapper__status-icon--${getStateClassModifier(entry.entry.state.value)}`]"></span>
                        <span class="overview-wrapper__status-text">{{ entry.entry.state.label }}</span>
                    </div>
                </yim-table-column>
            </template>
        </yim-table>
        <actions v-if="registrationActionTypes.length" :title="$t('My actions')" class="person__actions">
            <action
                v-for="(registrationActionType, index) in registrationActionTypes"
                :key="'processdefinition-' + index"
                :disabled="isRegistrationActionDisabled(registrationActionType.registrationActionType)"
                class="dashboard__action"
                :title="$t(registrationActionType.name)"
                @click.native="onSideBarRegistrationClick(registrationActionType.processId)">
            </action>
            <action :help="true"></action>
        </actions>
    </div>
</template>

<script lang="ts" src="./person-registrations.ts"></script>
