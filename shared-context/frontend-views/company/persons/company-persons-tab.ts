import PersonRoleTypeMixin from '@src/utils/mixins/person-role-type-mixin';
import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import
{
    CompanyPersonsFilterRequest,
    CompanyPersonListResource,
    WebProcessResource
} from '@src/models/generated/registration';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { registrationApiService } from '@src/services';
import { PersonRoleType } from '@src/models/generated/process-definitions';
import * as personTypes from '@src/components/yim-table/yim-table-filter/types/person-type';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import PersonTableMixin from '@src/utils/mixins/person-table-mixin';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class CompanyPersonsTab extends mixins(BaseMixin, EnumLocalizerMixin, PersonRoleTypeMixin, FilterMixin, KendoTableMixin, PersonTableMixin, CompanyMixin)
{
    rows: CompanyPersonListResource[] = [];
    totalCount = 0;
    personTypes = personTypes;

    get registrationActionTypes(): WebProcessResource[]
    {
        return this.currentUserProcessesStore.companyPersonsTab;
    }

    get pageCount(): number
    {
        return Math.ceil(this.totalCount / this.pageSize);
    }

    get getPageSize(): number
    {
        return this.pageSize;
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultHiddenColumns = [
            nameof<CompanyPersonListResource>('createdAt'),
            nameof<CompanyPersonListResource>('dossierLastModified'),
            nameof<CompanyPersonListResource>('firstArrival'),
            nameof<CompanyPersonListResource>('lastDeparture')
        ];

        this.defaultColumns = [];

        this.defaultColumns.push({
            field: nameof<CompanyPersonListResource>('type'),
            title: AppHost.i18n.global.t('Persontype') as string,
            headerClassName: getSortClass(),
            cell: 'type',
            width: '150px',
            sortable: false,
            filterCell: 'filterSlotType',
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('fullName'),
            title: AppHost.i18n.global.t('Person').toString(),
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px',
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('emailAddress'),
            title: AppHost.i18n.global.t('Email address').toString(),
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px',
            filterable: false,
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('personnelNumber'),
            title: AppHost.i18n.global.t('Personnel number').toString(),
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px',
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('phoneNumber'),
            title: AppHost.i18n.global.t('Phone number').toString(),
            headerClassName: getSortClass(),
            cell: 'personPhoneNumber',
            width: '150px',
            filterable: false,
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('dateOfBirth'),
            title: AppHost.i18n.global.t('Birth date').toString(),
            format: this.dateFormat,
            cell: 'date-birth',
            headerClassName: getSortClass(),
            filterCell: 'dateOfBirth',
            width: '180px',
            hidden: false
        },
        {
            field: nameof<CompanyPersonListResource>('createdAt'),
            title: AppHost.i18n.global.t('Created at').toString(),
            format: this.dateFormat,
            cell: 'created-at',
            headerClassName: getSortClass(),
            filterCell: 'createdAt',
            width: '180px',
            hidden: true
        },
        {
            field: nameof<CompanyPersonListResource>('dossierLastModified'),
            title: AppHost.i18n.global.t('Last modified').toString(),
            format: this.dateFormat,
            cell: 'dossier-last-modified',
            headerClassName: getSortClass(),
            filterCell: 'dossierLastModified',
            width: '180px',
            hidden: true
        },
        {
            field: nameof<CompanyPersonListResource>('firstArrival'),
            title: AppHost.i18n.global.t('First arrival').toString(),
            format: this.dateFormat,
            cell: 'first-arrival',
            headerClassName: getSortClass(),
            filterCell: 'firstArrival',
            width: '180px',
            hidden: true
        },
        {
            field: nameof<CompanyPersonListResource>('lastDeparture'),
            title: AppHost.i18n.global.t('Last departure').toString(),
            format: this.dateFormat,
            cell: 'last-departure',
            headerClassName: getSortClass(),
            filterCell: 'lastDeparture',
            width: '180px',
            hidden: true
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.currentUserProcessesStore.getMyProcessesAction();
        await this.getPersons();
    }

    @Watch('currentLocale')
    async onLocaleChanged(): Promise<void>
    {
        await this.currentUserProcessesStore.getMyProcessesAction(true);
        await this.getPersons();
    }

    @Watch('$route.query')
    async getPersons(): Promise<void>
    {
        const params = new CompanyPersonsFilterRequest({
            orderBy: this.$route.query.sort as string,
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            type: this.parseQueryEnumFilter<PersonRoleType>(PersonRoleType, nameof<CompanyPersonListResource>('type')),
            personName: this.$route.query.fullName as string,
            personnelNumber: this.$route.query.personnelNumber as string,
            dateOfBirthFrom: this.$route.query.dateOfBirthFrom as string ? new Date(this.$route.query.dateOfBirthFrom as string) : null,
            dateOfBirthTo: this.$route.query.dateOfBirthTo as string ? new Date(this.$route.query.dateOfBirthTo as string) : null,
            dossierLastModifiedFrom: this.$route.query.dossierLastModifiedFrom as string ? new Date(this.$route.query.dossierLastModifiedFrom as string) : null,
            dossierLastModifiedTo: this.$route.query.dossierLastModifiedTo as string ? new Date(this.$route.query.dossierLastModifiedTo as string) : null,
            createdAtFrom: this.$route.query.createdAtFrom as string ? new Date(this.$route.query.createdAtFrom as string) : null,
            createdAtTo: this.$route.query.createdAtTo as string ? new Date(this.$route.query.createdAtTo as string) : null,
            firstArrivalFrom: this.$route.query.firstArrivalFrom as string ? new Date(this.$route.query.firstArrivalFrom as string) : null,
            firstArrivalTo: this.$route.query.firstArrivalTo as string ? new Date(this.$route.query.firstArrivalTo as string) : null,
            lastDepartureFrom: this.$route.query.lastDepartureFrom as string ? new Date(this.$route.query.lastDepartureFrom as string) : null,
            lastDepartureTo: this.$route.query.lastDepartureTo as string ? new Date(this.$route.query.lastDepartureTo as string) : null
        });

        const response = await registrationApiService.findCompanyPersons(this.companyId, params);
        if (response.isSuccess)
        {
            this.rows = response.data.items;
            this.totalCount = response.data.totalCount ?? response.data.items.length;
        }
        else
        {
            this.rows = [];
            this.totalCount = 0;
        }
    }
}
