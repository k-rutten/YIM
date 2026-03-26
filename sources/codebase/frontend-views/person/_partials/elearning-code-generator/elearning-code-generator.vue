<template>
    <yim-dialog
        :title="$t('GenerateCode')"
        :description="description"
        :align-left="true"
        @save="save"
        @cancel="close">
        <template #content>
            <form-step-items>
                <form-step-item>
                    <template v-if="onSiteElearningInvitations.length > 0">
                        <div v-for="(code, index) in onSiteElearningInvitations" :key="index">
                            <text-preview
                                :value="code.elearningName"
                                :label="$t('CourseName')">
                            </text-preview>
                            <text-preview
                                v-if="code.details['courseCode']"
                                :value="code.details['courseCode']"
                                :label="$t('CourseCode')">
                            </text-preview>
                            <text-preview
                                v-if="code.details['pinCode']"
                                :value="code.details['pinCode']"
                                :label="$t('PinCode')">
                            </text-preview>
                        </div>
                    </template>
                    <div v-else>
                        <form-field-select
                            v-model="selectedGenerateOption"
                            :data-source="generateOptions"
                            text-field="name"
                            data-cy="form-field-select-generate-option"
                            value-field="id"></form-field-select>
                    </div>
                </form-step-item>
            </form-step-items>
        </template>
        <template #footer>
            <dialog-actions-bar>
                <yim-form-control
                    v-if="onSiteElearningInvitations.length > 0"
                    type="ghost"
                    :disabled="actionButtonIsDisabled"
                    @click.native="close">
                    {{ $t('Close') }}
                </yim-form-control>
                <template v-else>
                    <yim-form-control
                        :cancel="true"
                        @click.native="close">
                        {{ $t('Cancel') }}
                    </yim-form-control>
                    <yim-form-control
                        :disabled="actionButtonIsDisabled"
                        @click.native="save">
                        {{ $t('Submit') }}
                    </yim-form-control>
                </template>
            </dialog-actions-bar>
        </template>
    </yim-dialog>
</template>
<script lang="ts" src="./elearning-code-generator.ts"></script>
