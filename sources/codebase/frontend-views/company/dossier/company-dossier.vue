<template>
    <div>
        <table-wrapper>
            <template #table>
                <yim-dossier
                    v-if="sections.length"
                    :sections="sections">
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
                    class="company__content-no-results">
                    {{ $t('This company does not have a dossier') }}
                </div>
            </template>

            <template #actions>
                <actions v-if="registrationActionTypes.length || hasExternalAccreditation" :title="$t('My actions')">
                    <action
                        v-if="hasExternalAccreditation"
                        class="dashboard__action"
                        :title="$t('AccreditExternalCompany')"
                        @click.native="onExternalAccreditClick()">
                    </action>
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

    <company-external-accreditation-modal
        v-if="hasExternalAccreditation"
        :show="showExternalAccreditModal"
        @close="close">
    </company-external-accreditation-modal>
</template>

<script lang="ts" src="./company-dossier.ts"></script>
