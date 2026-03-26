import PersonRoleTypeMixin from '@src/utils/mixins/person-role-type-mixin';
import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import {
    AuthorizationDetailResource,
    AuthorizationMemberFilter,
    AuthorizationMemberListResource,
    AuthorizationState,
    NewAuthorizationMemberSchedule,
    UpdateAuthorizationMembersRequest,
    UpdateAuthorizationAllMembersRequest
} from '@src/models/generated/registration';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { DateTimePeriod, Period } from '@src/models/generated/common';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import * as personTypes from '@src/components/yim-table/yim-table-filter/types/person-type';
import * as authorizationStates from '@src/components/yim-table/yim-table-filter/types/authorization-state';
import { useAuthorizationMemberStore } from '@src/store/authorization-member-module';
import { registrationApiService } from '@src/services';
import AccessChangeDate from './access-change-date/access-change-date.vue';
import { GridRowClickEvent } from '@progress/kendo-vue-grid';
import { YimUrls } from '@src/utils/helpers/url';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { PersonRoleType, ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import { formatYimDate } from 'yim-common/src/utils/filters/dates/format';
import { CreateObjectURL } from '@src/utils/create-object-url';
import { AppHost } from 'yim-common/src/abstractions/app-host';
class AuthorizationAccessDetailFilteredForExport
{
    authorizationState: string;
    authorizedFrom: string;
    authorizedTo: string;
    employer!: string;
    fullName!: string;
    personnelNumber!: string;
    phoneNumber: string;
    type: string;
}

@Component({
    components: {
        AccessChangeDate
    }
})

export default class AuthorizationAccessDetail extends mixins(BaseMixin, KendoTableMixin, PersonRoleTypeMixin, EnumLocalizerMixin, FilterMixin)
{
    private readonly _authorizationMemberStore = useAuthorizationMemberStore();

    personTypes = personTypes;
    authorizationStates = authorizationStates;
    authorizationState = AuthorizationState;
    showAddPersonModal = false;
    showConfirmModal = false;
    showConfirmSelectAllModal = false;
    showChangeDateModal = false;
    isRemovingPersons = false;
    selectedPersonAuthorizationIds: string[] = [];
    selectedPersonAuthorizations: AuthorizationMemberListResource[] = [];
    activeTo = new Date();
    extendDateSelectAll: boolean = false;
    payloadDateSelectAll: UpdateAuthorizationAllMembersRequest = new UpdateAuthorizationAllMembersRequest();

    get description(): string
    {
        let description = '';
        description += this.authorization?.locations ? `${this.authorization.locations.map((location) => location.name).join(', ')} ` : '';
        description += this.authorization?.dateTimeSchedule?.name ? `${this.authorization.dateTimeSchedule.name.toLowerCase()} ` : '';
        description += this.authorization?.processDefinitionTypes ? `${this.authorization.processDefinitionTypes.map((type) =>
            this.getProcessDefinitionType(type).toLowerCase()).join(' ')}` : '';

        return description;
    }

    get authorization(): AuthorizationDetailResource
    {
        return this._authorizationMemberStore.authorization;
    }

    get authorizationMembersCount(): number
    {
        return this._authorizationMemberStore.authorizationMembersCount;
    }

    get authorizationMembers(): AuthorizationMemberListResource[]
    {
        return this._authorizationMemberStore.authorizationMembers;
    }

    get backUrl(): string
    {
        return YimUrls.getAuthorizationAccessOverviewUrl();
    }

    get newAuthorizationAccessUrl(): string
    {
        return YimUrls.newAuthorizationAccessUrl(this.authorizationId);
    }

    get authorizationId(): string
    {
        return this.$route.params.authorizationId as string;
    }

    get allPersonAuthorizationIds(): string[]
    {
        return this.authorizationMembers.filter((authorizationMember) => authorizationMember.authorizationState !== this.authorizationState.Expired).map((selectableAuthorizationMember) => selectableAuthorizationMember.personAuthorizationId);
    }

    onToggleExtendDateSelectAll(): void
    {
        this.selectedPersonAuthorizations = [
            new AuthorizationMemberListResource({
                personnelNumber: '',
                employer: '',
                fullName: ''
            })
        ];
        this.extendDateSelectAll = true;
        this.showChangeDateModal = true;
    }

    saveDates(adjustedPersonAuthorizations: AuthorizationMemberListResource[]): Promise<void>
    {
        return !this.extendDateSelectAll ? this.updateAuthorizationDates(adjustedPersonAuthorizations) : this.confirmSelectAllDates(adjustedPersonAuthorizations);
    };

    async confirmSelectAllDates(adjustedPersonAuthorizations: AuthorizationMemberListResource[]): Promise<void>
    {
        this.payloadDateSelectAll = new UpdateAuthorizationAllMembersRequest({
            scheduleTo: adjustedPersonAuthorizations[0].authorizedTo
        });
        this.showChangeDateModal = false;
        this.showConfirmSelectAllModal = true;
    };

    async saveSelectAllDates(): Promise<void>
    {
        this.extendDateSelectAll = false;
        this.showConfirmSelectAllModal = false;
        this.payloadDateSelectAll.searchParams = this.searchParams(); // * Add searchParams to payload
        const response = await registrationApiService.updateAuthorizationAllMembers(this.authorizationId, this.payloadDateSelectAll);
        if (response.isSuccess)
        {
            this.showServiceSuccess('ApplyAuthorizationAccessEndDateStartedSuccessfully');
        }
        else
        {
            this.showServiceError(response);
        }
    }

    async updateAuthorizationDates(adjustedPersonAuthorizations: AuthorizationMemberListResource[]): Promise<void>
    {
        const newAuthorizationMemberSchedule: NewAuthorizationMemberSchedule[] = [];

        adjustedPersonAuthorizations.forEach((adjustedPersonAuthorization) =>
        {
            const authorizationMember = this.getPersonById(adjustedPersonAuthorization.personAuthorizationId);

            if (authorizationMember?.authorizedFrom)
            {
                const member = new NewAuthorizationMemberSchedule({
                    oldPeriod: new DateTimePeriod({
                        from: authorizationMember.authorizedFrom,
                        to: authorizationMember.authorizedTo
                    }),
                    newPeriod: new DateTimePeriod({
                        from: authorizationMember.authorizedFrom,
                        to: adjustedPersonAuthorization.authorizedTo
                    }),
                    personAuthorizationId: authorizationMember.personAuthorizationId
                });

                newAuthorizationMemberSchedule.push(member);
            }
        });

        const response = await registrationApiService.updateAuthorizationMembers(new UpdateAuthorizationMembersRequest({
            changes: newAuthorizationMemberSchedule
        }));
        if (response.isSuccess)
        {
            await this.findAuthorizationMembers();
            this.showServiceSuccess('EndDateChanged');
        }
        else
        {
            this.showServiceError(response);
        }

        this.selectedPersonAuthorizationIds = [];
        this.selectedPersonAuthorizations = [];
        this.showChangeDateModal = false;
    }

    getProcessDefinitionType(type: ProcessDefinitionTypes): string
    {
        return this.getLocalizedProcessDefinitionTypeName(ProcessDefinitionTypes[type]);
    }

    getTypeName(type: PersonRoleType): string
    {
        return this.getLocalizedPersonRoleTypeName(PersonRoleType[type]);
    }

    getStateName(state: AuthorizationState): string
    {
        return this.getLocalizedAuthorizationStateName(AuthorizationState[state]);
    }

    hasPersonsSelected(): boolean
    {
        return this.selectedPersonAuthorizationIds.length > 0;
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.findAuthorizationMembers();
        this.loadAuthorization();
    }

    loadAuthorization(): void
    {
        this._authorizationMemberStore.loadAuthorizationAction(this.authorizationId);
    }

    async removeAuthorizations(): Promise<void>
    {
        const removedAuthorizationIds: string[] = [];
        try
        {
            this.isRemovingPersons = true;
            for (const personAuthorizationId of this.selectedPersonAuthorizationIds)
            {
                const response = await registrationApiService.deleteAuthorizationMember(personAuthorizationId);
                if (response.isSuccess)
                {
                    this.showServiceSuccess('PersonRemoved');
                    removedAuthorizationIds.push(personAuthorizationId);
                }
                else
                {
                    this.showServiceError(response);
                    break;
                }
            }
        }
        finally
        {
            removedAuthorizationIds.forEach((authorizationId) =>
            {
                const index = this.selectedPersonAuthorizationIds.findIndex((id) => authorizationId === id);
                this.selectedPersonAuthorizationIds.splice(index, 1);
            });

            await this.findAuthorizationMembers();
            this.showConfirmModal = false;
            this.isRemovingPersons = false;
        }
    }

    onToggleCheckbox($event: GridRowClickEvent): void
    {
        this.extendDateSelectAll = false;

        const index = this.selectedPersonAuthorizationIds.findIndex((id) => $event.dataItem.personAuthorizationId === id);
        if (index === -1)
        {
            this.selectedPersonAuthorizationIds.push($event.dataItem.personAuthorizationId);
            this.selectedPersonAuthorizations.push($event.dataItem);
        }
        else
        {
            this.selectedPersonAuthorizationIds.splice(index, 1);
            this.selectedPersonAuthorizations.splice(index, 1);
        }
    }

    getPersonById(personAuthorizationId: string): AuthorizationMemberListResource | null
    {
        return this.authorizationMembers.find((authorizationMember) => authorizationMember.personAuthorizationId === personAuthorizationId) ?? null;
    }

    personsAdded(): void
    {
        this.findAuthorizationMembers();
        this.showAddPersonModal = false;
    }

    searchParams(): AuthorizationMemberFilter
    {
        const params = new AuthorizationMemberFilter({
            orderBy: this.$route.query.sort as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            authorizedFrom: this.$route.query.authorizedFromFrom as string ?
                new Period({
                    from: new Date(this.$route.query.authorizedFromFrom as string),
                    to: new Date(this.$route.query.authorizedFromTo as string)
                }) : null,
            authorizedTo: this.$route.query.authorizedToFrom as string ?
                new Period({
                    from: new Date(this.$route.query.authorizedToFrom as string),
                    to: new Date(this.$route.query.authorizedToTo as string)
                }) : null,
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
            states: this.parseQueryEnumFilter<AuthorizationState>(AuthorizationState, 'states') ?? [],
            selectedPersonAuthorizationIds: this.selectedPersonAuthorizationIds
        });

        if (params.states === null || params.states.length === 0)
        {
            params.states = [AuthorizationState.Active, AuthorizationState.Upcoming];
        }

        return params;
    }

    @Watch('$route.query')
    async findAuthorizationMembers(): Promise<void>
    {
        return this._authorizationMemberStore.loadAuthorizationMembersAction({ authorizationId: this.authorizationId, params: this.searchParams() });
    }

    @Watch('extendDateSelectAll')
    cleanSelectedList()
    {
        if (!this.extendDateSelectAll)
        {
            this.selectedPersonAuthorizationIds = [];
            this.selectedPersonAuthorizations = [];
        }
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultHiddenColumns = [
            nameof<AuthorizationMemberListResource>('personId'),
            nameof<AuthorizationMemberListResource>('phoneNumber'),
            nameof<AuthorizationMemberListResource>('emailAddress')
        ];

        this.defaultColumns = [];

        this.defaultColumns.push({
            field: 'selection',
            title: AppHost.i18n.global.t('Selection') as string,
            cell: 'selection',
            sortable: false,
            filterCell: 'filterSlotSelection',
            width: '100px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('type'),
            title: AppHost.i18n.global.t('Type') as string,
            headerClassName: getSortClass(),
            cell: 'type',
            width: '150px',
            sortable: false,
            filterCell: 'filterSlotType'
        },
        {
            field: nameof<AuthorizationMemberListResource>('personnelNumber'),
            title: AppHost.i18n.global.t('PersonNumber') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('fullName'),
            title: AppHost.i18n.global.t('Person') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('employer'),
            title: AppHost.i18n.global.t('Employer') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('phoneNumber'),
            title: AppHost.i18n.global.t('Phone number') as string,
            headerClassName: getSortClass(),
            cell: 'personPhoneNumber',
            width: '150px',
            filterable: false,
            sortable: false,
            hidden: true
        },
        {
            field: nameof<AuthorizationMemberListResource>('authorizedFrom'),
            title: AppHost.i18n.global.t('StartAuthorization') as string,
            headerClassName: getSortClass(),
            format: this.dateFormat,
            filterCell: 'authorizedFrom',
            cell: 'authorized-from',
            width: '180px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('authorizedTo'),
            title: AppHost.i18n.global.t('EndAuthorization') as string,
            headerClassName: getSortClass(),
            format: this.dateFormat,
            filterCell: 'authorizedTo',
            cell: 'authorized-to',
            width: '180px'
        },
        {
            field: nameof<AuthorizationMemberListResource>('authorizationState'),
            title: AppHost.i18n.global.t('State') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotState',
            cell: 'authorizationState',
            width: '180px'
        });

        this.columns = this.defaultColumns;
    }

    beforeDestroy(): void
    {
        this._authorizationMemberStore.clearAuthorizationMemberMutation();
    }

    downloadFileName(): string
    {
        return AppHost.i18n.global.t('AccessRules') + ' ' + this.authorization.name.replaceAll(/[<>?"|*/\\:.,]/g, '_') + formatYimDate(new Date(), '_yyyyMMdd');
    }

    async downloadExcel(): Promise<void>
    {
        const response = await registrationApiService.downloadSpreadsheetAuthorizationMembers(this.authorizationId, this.searchParams());
        if (response.isSuccess)
        {
            const url = CreateObjectURL.createTypedObjectURL(response, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const link = document.createElement('a');

            link.setAttribute('href', url);
            link.style.visibility = 'hidden';
            const fileName = this.downloadFileName() + '.xlsx';
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    async downloadCsv(): Promise<void>
    {
        const response = await registrationApiService.downloadCsvAuthorizationMembers(this.authorizationId, this.searchParams());
        if (response.isSuccess)
        {
            const url = CreateObjectURL.createTypedObjectURL(response, 'text/csv');
            const link = document.createElement('a');

            link.setAttribute('href', url);
            link.style.visibility = 'hidden';
            const fileName = this.downloadFileName() + '.csv';
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    mapAuthorizationMembersToExport(authorizationMembers: AuthorizationMemberListResource[]): AuthorizationAccessDetailFilteredForExport[]
    {
        return authorizationMembers.map((authorizationMember) => ({
            type: this.getTypeName(authorizationMember.type),
            fullName: this.getPersonById(authorizationMember.personAuthorizationId).fullName,
            employer: authorizationMember.employer,
            authorizedFrom: this.formatYimTime(authorizationMember.authorizedFrom),
            authorizedTo: this.formatYimTime(authorizationMember.authorizedTo),
            personnelNumber: authorizationMember.personnelNumber,
            phoneNumber: this.getPhoneNumber(this.getPersonById(authorizationMember.personAuthorizationId).phoneNumber ?? ''),
            authorizationState: this.getStateName(authorizationMember.authorizationState)
        }));
    }
}
