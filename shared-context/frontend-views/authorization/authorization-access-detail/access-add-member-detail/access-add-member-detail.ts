import { Period } from '@src/models/generated/common';
import { PersonRoleType, ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import { FormFieldButtonToggleValues, MaximumValidityDates } from '@src/models/models';
import { useAuthorizationMemberStore } from '@src/store/authorization-member-module';
import { YimUrls } from '@src/utils/helpers/url';
import { ValidityUtils } from '@src/utils/helpers/validity-utils';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import cloneDeep from 'lodash/cloneDeep';
import { Component, mixins, Watch } from 'vue-facing-decorator';
import YimSidebarSteps from 'yim-common/src/components/yim-sidebar-steps/yim-sidebar-steps.vue';
import { ISelectListData } from 'yim-common/src/models/models';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { AuthorizationDetailResource, AuthorizationMemberCandidateFilter, AuthorizationMemberCandidateFilterType, AuthorizationMemberCandidateListResource, AuthorizationMemberFilter, AuthorizationState, PeriodOfAccessLimitResource, ValidityUnitSize } from '@src/models/generated/registration';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { Form } from 'vee-validate';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    components: {
        'yim-sidebar-steps': YimSidebarSteps,
        Form
    }
})
export default class AccessAddMemberDetail extends mixins(BaseMixin, EnumLocalizerMixin, FilterMixin)
{
    private readonly _authorizationMemberStore = useAuthorizationMemberStore();

    selectedFilterType = AuthorizationMemberCandidateFilterType.Name;
    selectedAuthorizationMember: AuthorizationMemberCandidateListResource[] = [];
    value = '';
    keyboardTimeout: number | null = null;
    loading = false;
    fullName = '';
    authorizationPeriod: Period = new Period({ from: new Date(), to: null });
    authorizationMemberCandidateFilterType = AuthorizationMemberCandidateFilterType;

    searchFilter: AuthorizationMemberCandidateFilter = new AuthorizationMemberCandidateFilter({
        orderBy: 'fullName',
        page: 1,
        pageSize: paginationOptions.defaultPageSize
    });

    filterTypes: ISelectListData[] = [
        {
            id: AuthorizationMemberCandidateFilterType.Name,
            name: `${AppHost.i18n.global.t('Name')}`
        },
        {
            id: AuthorizationMemberCandidateFilterType.PersonnelNumber,
            name: AppHost.i18n.global.t('PersonNumber') as string
        },
        {
            id: AuthorizationMemberCandidateFilterType.IdentifierNumber,
            name: `${AppHost.i18n.global.t('IdentifierNumber')}`
        }
    ];

    validityUnitSize = ValidityUnitSize;
    setPeriodOfAccessLimit: PeriodOfAccessLimitResource = new PeriodOfAccessLimitResource({ validityUnitSize: 0 });
    useValidityPicker = false;
    limitedValidity = false;
    validityPickerOptions = [
        new FormFieldButtonToggleValues({
            name: AppHost.i18n.global.t('ValidityPicker') as string,
            value: true
        }),
        new FormFieldButtonToggleValues({
            name: AppHost.i18n.global.t('DatePicker') as string,
            value: false
        })
    ];

    get description(): string
    {
        let description = '';
        description += this.authorization?.locations ? `${this.authorization.locations.map((location) => location.name).join(', ')} ` : '';
        description += this.authorization?.dateTimeSchedule?.name ? `${this.authorization.dateTimeSchedule.name.toLowerCase()} ` : '';
        description += this.authorization?.processDefinitionTypes ? `${this.authorization.processDefinitionTypes.map((type) =>
            this.getProcessDefinitionType(type).toLowerCase()).join(' ')}` : '';

        return description;
    }

    get authorizationMemberCandidates(): AuthorizationMemberCandidateListResource[]
    {
        return this._authorizationMemberStore.authorizationMemberCandidates;
    }

    get authorization(): AuthorizationDetailResource
    {
        return this._authorizationMemberStore.authorization;
    }

    get authorizationId(): string
    {
        return this.$route.params.authorizationId as string;
    }

    get selectedAuthorizationMemberDates(): AuthorizationMemberCandidateListResource | null
    {
        if (this.selectedAuthorizationMember[0])
        {
            return this.selectedAuthorizationMember[0];
        }

        return null;
    }

    async onChange(event: string): Promise<void>
    {
        if (this.keyboardTimeout)
        {
            clearTimeout(this.keyboardTimeout);
        }

        this.value = event;

        // 120 limit ~= 40 (Name) + 25 (Prefix) + 50 (LastName)
        if (this.value.length > 120)
        {
            return;
        }

        this.loading = true;
        this.keyboardTimeout = window.setTimeout(async () =>
        {
            try
            {
                await this.onAuthorizationMemberSearch();
            }
            finally
            {
                this.loading = false;
            }
        }, 500);
    }

    async onAuthorizationMemberSelect(selectedAuthorizationMembers: AuthorizationMemberCandidateListResource): Promise<void>
    {
        this.selectedAuthorizationMember = [cloneDeep(selectedAuthorizationMembers)];
        this.fullName = selectedAuthorizationMembers.fullName ?? '';
    }

    async onAuthorizationMemberRemove(): Promise<void>
    {
        this.value = '';
        this.fullName = '';
    }

    onAuthorizationMemberSearch(): Promise<void>
    {
        return this._authorizationMemberStore.loadAuthorizationMemberCandidatesAction({
            authorizationId: this.authorizationId,
            searchFilter: new AuthorizationMemberCandidateFilter({
                filterType: this.selectedFilterType,
                fullName: this.searchFilter.fullName,
                personNumber: this.searchFilter.personNumber,
                orderBy: this.searchFilter.orderBy,
                page: this.searchFilter.page,
                pageSize: this.searchFilter.pageSize,
                identifierNumber: this.searchFilter.identifierNumber
            })
        });
    }

    maximumValidityDates(validFromDateTime: Date): MaximumValidityDates
    {
        return ValidityUtils.maximumValidityDates(validFromDateTime, this.setPeriodOfAccessLimit.validityUnitSize, this.setPeriodOfAccessLimit.validityUnit, true);
    }

    setValidityUnit(unit: number): void
    {
        if (this.setPeriodOfAccessLimit && unit)
        {
            this.setPeriodOfAccessLimit.validityUnit = unit;

            this.calculateToDate();
        }
    }

    setValidityUnitSize(unitSize: ValidityUnitSize | null): void
    {
        if (this.setPeriodOfAccessLimit && unitSize !== null)
        {
            this.setPeriodOfAccessLimit.validityUnitSize = unitSize;

            this.calculateToDate();
        }
    }

    @Watch('useDatePicker')
    calculateToDate(): void
    {
        if (this.setPeriodOfAccessLimit.validityUnit)
        {
            const fromDate = new Date(this.authorizationPeriod.from);
            this.authorizationPeriod.to = ValidityUtils.calculateDate(fromDate, this.setPeriodOfAccessLimit.validityUnitSize, this.setPeriodOfAccessLimit.validityUnit);
        }
    }

    getProcessDefinitionType(type: ProcessDefinitionTypes): string
    {
        return this.getLocalizedProcessDefinitionTypeName(ProcessDefinitionTypes[type]);
    }

    async created(): Promise<void>
    {
        await this.findAuthorizationMembers();
        this.loadAuthorization();
    }

    loadAuthorization(): void
    {
        this._authorizationMemberStore.loadAuthorizationAction(this.authorizationId);
    }

    @Watch('$route.query')
    async findAuthorizationMembers(): Promise<void>
    {
        const params = new AuthorizationMemberFilter({
            orderBy: this.$route.query.sort as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            authorizedFrom: this.$route.query.authorizedFromFrom as string ?
                new Period({ from: new Date(this.$route.query.authorizedFromFrom as string),
                    to: new Date(this.$route.query.authorizedFromTo as string) }) : null,
            authorizedTo: this.$route.query.authorizedToFrom as string ?
                new Period({ from: new Date(this.$route.query.authorizedToFrom as string),
                    to: new Date(this.$route.query.authorizedToTo as string) }) : null,
            dateOfBirth: this.$route.query.dateOfBirthFrom as string ?
                new Period({
                    from: new Date(this.$route.query.dateOfBirthFrom as string),
                    to: new Date(this.$route.query.dateOfBirthTo as string)
                }) : null,
            employer: this.$route.query.employer as string,
            fullName: this.$route.query.fullName as string,
            mailAddress: this.$route.query.emailAddress as string,
            personnelNumber: this.$route.query.personnelNumber as string,
            types: this.parseQueryEnumFilter<PersonRoleType>(PersonRoleType, 'types') ?? [],
            states: this.parseQueryEnumFilter<AuthorizationState>(AuthorizationState, 'states') ?? []
        });

        if (params.states === null || params.states.length === 0)
        {
            params.states = [AuthorizationState.Active, AuthorizationState.Upcoming];
        }

        return this._authorizationMemberStore.loadAuthorizationMembersAction({ authorizationId: this.authorizationId, params });
    }

    async save(): Promise<void>
    {
        this.disableActionButton();

        const validationResult = await this.validate();
        if (!validationResult.valid)
        {
            this.enableActionButton();
            return;
        }

        const response = await this._authorizationMemberStore.addAuthorizationMembersAction({
            authorizationId: this.authorizationId,
            selectedAuthorizationMembers: this.selectedAuthorizationMember,
            authorizationPeriod: this.authorizationPeriod });
        if (response.isSuccess)
        {
            await this.goBack();
            this.showServiceSuccess('PersonsAdded');
        }
        else
        {
            this.showServiceError(response);
        }

        this.enableActionButton();
    }

    async goBack(): Promise<void>
    {
        await this.$router.push(YimUrls.getAuthorizationAccessDetailUrl(this.authorizationId));
    }
}
