<template>
    <div>
        <yim-sidebar :header="$t('Add person')">
            <yim-sidebar-steps>
                <yim-sidebar-step :is-active="true" :is-complete="true">
                    {{ $t('Information') }}
                </yim-sidebar-step>
            </yim-sidebar-steps>
        </yim-sidebar>
        <Form
            ref="validationObserver"
            v-slot="{errors}">
            <form-steps>
                <form-step>
                    <form-step-header :number="1">
                        <form-step-intro
                            :title="authorization.name"
                            :description="description"></form-step-intro>
                    </form-step-header>
                    <form-step-rows>
                        <form-step-row>
                            <form-step-items :title="$t('Search person')">
                                <form-step-item>
                                    <div v-if="fullName" class="access-add-member-detail__input">
                                        <span class="access-add-member-detail__name">
                                            {{ fullName }}
                                            <button
                                                type="button"
                                                class="access-add-member-detail__remove"
                                                @click="onAuthorizationMemberRemove">
                                                <icon-delete></icon-delete>
                                            </button>
                                        </span>
                                    </div>

                                    <template v-else>
                                        <form-field-select
                                            v-model="selectedFilterType"
                                            :data-source="filterTypes"
                                            text-field="name"
                                            :label="$t('SearchType')"
                                            data-cy="form-field-select-search-type"
                                            value-field="id"></form-field-select>

                                        <form-field-autocomplete
                                            v-if="selectedFilterType === authorizationMemberCandidateFilterType.Name"
                                            v-model="searchFilter.fullName"
                                            :items="authorizationMemberCandidates"
                                            :loading="loading"
                                            :rules="'max:120'"
                                            name="personName"
                                            title-field="fullName"
                                            sub-title-field="companyName"
                                            body-field="emailAddress"
                                            :label="$t('Search by name')"
                                            data-cy="form-field-autocomplete-search-by-name"
                                            @change="onChange"
                                            @select="onAuthorizationMemberSelect">
                                        </form-field-autocomplete>

                                        <form-field-autocomplete
                                            v-if="selectedFilterType === authorizationMemberCandidateFilterType.PersonnelNumber"
                                            v-model="searchFilter.personNumber"
                                            :items="authorizationMemberCandidates"
                                            :loading="loading"
                                            :rules="'max:120'"
                                            name="personNumber"
                                            title-field="fullName"
                                            sub-title-field="companyName"
                                            body-field="emailAddress"
                                            :label="$t('Search by person number')"
                                            data-cy="form-field-autocomplete-search-by-personnel-number"
                                            @change="onChange"
                                            @select="onAuthorizationMemberSelect">
                                        </form-field-autocomplete>

                                        <form-field-autocomplete
                                            v-if="selectedFilterType === authorizationMemberCandidateFilterType.IdentifierNumber"
                                            v-model="searchFilter.identifierNumber"
                                            :items="authorizationMemberCandidates"
                                            :loading="loading"
                                            :rules="'max:120'"
                                            name="identifierNumber"
                                            title-field="fullName"
                                            sub-title-field="companyName"
                                            body-field="emailAddress"
                                            :label="$t('SearchByIdentificationNumber')"
                                            data-cy="form-field-autocomplete-search-by-identifier-number"
                                            @change="onChange"
                                            @select="onAuthorizationMemberSelect">
                                        </form-field-autocomplete>
                                    </template>
                                </form-step-item>
                            </form-step-items>
                        </form-step-row>

                        <form-step-row v-if="fullName">
                            <form-step-items :title="$t('ChoosePeriod')">
                                <form-step>
                                    <form-step-item>
                                        <label class="access-add-member-detail__label">
                                            {{ $t('Period of access') }}: {{ selectedAuthorizationMemberDates.periodOfAccessFrom !== null ? formatYimDate(selectedAuthorizationMemberDates.periodOfAccessFrom) : '-' }} {{ $t('UpAndUntil').toLowerCase() }} {{ selectedAuthorizationMemberDates.periodOfAccessTo !== null ? formatYimDate(selectedAuthorizationMemberDates.periodOfAccessTo) : '-' }}
                                        </label>
                                    </form-step-item>
                                    <form-step-item>
                                        <form-field-date
                                            v-model="authorizationPeriod.from"
                                            name="activeFrom"
                                            :rules="{ required: true, sameDayOrBefore: [authorizationPeriod.to]}"
                                            :allow-past-dates="false"
                                            :allow-future-dates="true"
                                            :custom-min-date="selectedAuthorizationMemberDates.periodOfAccessFrom "
                                            :custom-max-date="authorizationPeriod.to"
                                            data-cy="form-field-date-start-authorization"
                                            :label="$t('StartAuthorization')"></form-field-date>
                                    </form-step-item>

                                    <form-step-item v-if="selectedAuthorizationMemberDates && !selectedAuthorizationMemberDates.periodOfAccessTo">
                                        <form-field-yes-no
                                            v-model="limitedValidity"
                                            :rules="'required'"
                                            data-cy="form-field-yes-no-limited-validity"
                                            :label="$t('LimitedValidity')"></form-field-yes-no>
                                    </form-step-item>
                                    <template v-if="(selectedAuthorizationMember && selectedAuthorizationMemberDates.periodOfAccessTo) || limitedValidity">
                                        <form-step-item>
                                            <form-field-buttons-toggle
                                                v-model="useValidityPicker"
                                                name="LimitedValidity"
                                                :label="$t('DateSelectionType')"
                                                :use-boolean="true"
                                                data-cy="form-field-buttons-toggle-limited-validity"
                                                :options="validityPickerOptions"></form-field-buttons-toggle>
                                        </form-step-item>
                                        <form-step-item v-if="!useValidityPicker">
                                            <form-field-date
                                                v-model="authorizationPeriod.to"
                                                name="activeTo"
                                                data-cy="form-field-date-end-authorization"
                                                :rules="{
                                                    required: true,
                                                    sameDayOrLater: [ authorizationPeriod.from ],
                                                    checkWithPeriodOfAccessDateFrom: authorizationPeriod.from,
                                                    checkWithPeriodOfAccessDateTo: selectedAuthorizationMemberDates.periodOfAccessTo }"
                                                :label="$t('EndAuthorization')"
                                                :custom-min-date="authorizationPeriod.from"
                                                :custom-max-date="selectedAuthorizationMemberDates.periodOfAccessTo"
                                                :allow-past-dates="false"
                                                :allow-future-dates="true"></form-field-date>
                                        </form-step-item>
                                        <form-step-item v-if="useValidityPicker">
                                            <yim-validity
                                                :label="$t('Validity')"
                                                :use-global-validity="true"
                                                :unit-size="setPeriodOfAccessLimit.validityUnitSize"
                                                :unit="setPeriodOfAccessLimit.validityUnit"
                                                :data-read-only="!useValidityPicker"
                                                :rules="{
                                                    todayOrLater: true,
                                                    checkWithPeriodOfAccessDateFrom: selectedAuthorizationMemberDates.periodOfAccessFrom,
                                                    checkWithPeriodOfAccessDateTo: selectedAuthorizationMemberDates.periodOfAccessTo
                                                }"
                                                :custom-min-date="selectedAuthorizationMemberDates.periodOfAccessFrom"
                                                :custom-max-date="selectedAuthorizationMemberDates.periodOfAccessTo"
                                                :max-validity-dates="maximumValidityDates(authorizationPeriod.from)"
                                                data-cy="yim-validity-period-of-access"
                                                @changeUnit="setValidityUnit"
                                                @changeUnitSize="setValidityUnitSize">
                                            </yim-validity>
                                            <text-preview
                                                v-if="authorizationPeriod.to && setPeriodOfAccessLimit.validityUnit"
                                                :value="formatYimDate(authorizationPeriod.to.toString())"
                                                :label="$t('PeriodOfAccessTo')"></text-preview>
                                        </form-step-item>
                                    </template>
                                </form-step>
                            </form-step-items>
                        </form-step-row>
                    </form-step-rows>
                </form-step>
            </form-steps>

            <yim-form-controls>
                <yim-form-control
                    :back="true"
                    type="text"
                    data-cy="button-back"
                    @click.native="goBack">
                    {{ $t('Back') }}
                </yim-form-control>

                <template #messages>
                    <yim-form-message
                        v-if="errors"
                        :errors="errors">
                    </yim-form-message>
                </template>

                <yim-form-control
                    :disabled="actionButtonIsDisabled"
                    data-cy="button-save"
                    @click.native="save">
                    {{ $t('Save') }}
                </yim-form-control>
            </yim-form-controls>
        </Form>
    </div>
</template>

<script lang="ts" src="./access-add-member-detail.ts"></script>
<style lang="scss" src="./access-add-member-detail.scss"></style>
