<template>
    <div class="person__content--sidebar person__content">
        <yim-person-authorizations-grid
            :person-id="personId"
            :show-no-result="true"
            class="person__details"
            layout="small"></yim-person-authorizations-grid>
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

<script lang="ts" src="./person-authorizations.ts"></script>
