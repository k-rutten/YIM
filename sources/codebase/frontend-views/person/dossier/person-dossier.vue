<template>
    <div class="person__content person__content--sidebar">
        <yim-dossier
            v-if="sections.length"
            :sections="sections"
            class="person__details">
            <template #default="data">
                <component
                    :is="component.type + '-preview'"
                    v-for="(component, componentIndex) in data.components"
                    :key="component.name + componentIndex"
                    :data-component-mode="dataComponentMode"
                    :data="component"
                    class="yim-dossier__item"
                    :file-access="component.hasFileAccess"></component>
            </template>
        </yim-dossier>

        <div
            v-else
            class="person__content-no-results">
            {{ $t('This person does not have a dossier') }}
        </div>

        <actions v-if="registrationActionTypes.length" :title="$t('My actions')" class="person__actions">
            <action
                v-for="(registrationActionType, index) in registrationActionTypes"
                :key="'processdefinition-' + index"
                class="dashboard__action"
                :title="$t(registrationActionType.name)"
                :disabled="isRegistrationActionDisabled(registrationActionType.registrationActionType)"
                @click.native="onRegistrationClick(registrationActionType.processId, personId)">
            </action>

            <person-photo-upload-action></person-photo-upload-action>
            <person-sync-action></person-sync-action>

            <action :help="true"></action>
        </actions>
    </div>
</template>

<script lang="ts" src="./person-dossier.ts"></script>
