<template>
    <Form ref="validationObserver">
        <yim-dialog
            v-if="show"
            :show="show"
            :is-saving="true"
            :title="$t('ChangeDate')">
            <template #content>
                <form-step-items>
                    <form-step-item
                        v-for="(toUpdatedAuthorization, index) in toUpdatePersonAuthorizations"
                        :key="toUpdatedAuthorization.fullName + index">
                        <form-field-date
                            v-model="toUpdatedAuthorization.authorizedTo"
                            :min="toUpdatedAuthorization.authorizedFrom"
                            name="activeTo"
                            data-cy="form-field-date-end-authorization"
                            :rules="{
                                required: !!toUpdatedAuthorization.periodOfAccessTo || selectedAll,
                                sameDayOrLater: [toUpdatedAuthorization.authorizedFrom],
                                checkWithPeriodOfAccessDateFrom: toUpdatedAuthorization.periodOfAccessFrom,
                                checkWithPeriodOfAccessDateTo: toUpdatedAuthorization.periodOfAccessTo,
                            }"
                            :label="`${$t(`EndAuthorization`)} ${toUpdatedAuthorization.fullName}`"
                            :allow-past-dates="false"
                            :allow-future-dates="true">
                        </form-field-date>
                    </form-step-item>
                </form-step-items>
            </template>
            <template #footer>
                <dialog-actions-bar>
                    <yim-form-control
                        :ghost="true"
                        data-cy="button-cancel"
                        @click.native="$emit('cancel')">
                        {{ $t('Cancel') }}
                    </yim-form-control>
                    <yim-form-control
                        :loading="isSaving"
                        :disabled="actionButtonIsDisabled"
                        data-cy="button-save"
                        @click.native="save">
                        {{ $t('Save') }}
                    </yim-form-control>
                </dialog-actions-bar>
            </template>
        </yim-dialog>
    </Form>
</template>

<script lang="ts" src="./access-change-date.ts"></script>
