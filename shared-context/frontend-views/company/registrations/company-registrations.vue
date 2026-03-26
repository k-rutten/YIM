<template>
    <div>
        <table-wrapper>
            <template v-if="registrations" #table>
                <yim-table
                    :data="registrations"
                    @onRowClick="onRegistrationDetailClick">
                    <template #default="entry">
                        <yim-table-column
                            :label="$t('Type')"
                            :value="$t(entry.entry.processName)">
                        </yim-table-column>
                        <yim-table-column>
                            <div class="overview-wrapper__status">
                                <span
                                    :class="['overview-wrapper__status-icon', `overview-wrapper__status-icon--${getStateClassModifier(entry.entry.state.value)}`]"></span>
                                <span class="overview-wrapper__status-text">{{ entry.entry.state.label }}</span>
                            </div>
                        </yim-table-column>
                    </template>
                </yim-table>
            </template>
            <template #actions>
                <actions v-if="registrationActionTypes.length" :title="$t('My actions')">
                    <action
                        v-for="(registrationActionType, index) in registrationActionTypes"
                        :key="'processdefinition-' + index"
                        class="dashboard__action"
                        :title="$t(registrationActionType.name)"
                        @click.native="onRegistrationClick(registrationActionType.processId, registrationActionType.registrationActionType)">
                    </action>
                    <action :help="true"></action>
                </actions>
            </template>
        </table-wrapper>
    </div>

    <company-deactivation-modal
        v-if="hasCompanyDeactivatePermission"
        :show="showDeactivationModal"
        @close="close">
    </company-deactivation-modal>

    <company-reactivation-modal
        v-if="hasCompanyReactivatePermission"
        :show="showReactivationModal"
        @close="close">
    </company-reactivation-modal>
</template>

<script lang="ts" src="./company-registrations.ts"></script>
