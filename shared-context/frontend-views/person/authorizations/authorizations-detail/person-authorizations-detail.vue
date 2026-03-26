<template>
    <div class="person__content--sidebar person__content">
        <yim-person-authorizations-grid-detail
            :person-id="personId"
            :period-of-access-to="personPeriodOfAccess"
            :show-no-result="true"
            class="person__details"
            layout="small"
            :enable-history="hasHistory()"></yim-person-authorizations-grid-detail>
        <actions v-if="registrationActionTypes.length" :title="$t('My actions')" class="person__actions">
            <action
                v-for="(registrationActionType, index) in registrationActionTypes"
                :key="'processdefinition-' + index"
                :disabled="isRegistrationActionDisabled(registrationActionType.registrationActionType)"
                class="dashboard__action"
                :title="$t(registrationActionType.name)"
                @click.native="onRegistrationClick(registrationActionType.processId, personId)">
            </action>
            <action :help="true"></action>
        </actions>
    </div>
</template>

<script lang="ts" src="./person-authorizations-detail.ts"></script>
