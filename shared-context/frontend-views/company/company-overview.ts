import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import {
    CompaniesFilter,
    CompanyListResource,
    CompanyState,
    CompanyFilter,
    WebProcessResource,
    CompaniesScope
} from '@src/models/generated/registration';
import { useDossierStore } from '@src/store/dossier-module';
import * as paginationOptions from '@src/utils/types/pagination-options';
import * as companyFilters from '@src/components/yim-table/yim-table-filter/types/company-filter';
import { YimUrls } from '@src/utils/helpers/url';
import { useCurrentUserProcessesStore } from '@src/store/current-user-processes-module';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import RegistrationActionMixin from '@src/utils/mixins/registration-action-mixin';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import cloneDeep from 'lodash/cloneDeep';
import { AppHost } from 'yim-common/src/abstractions/app-host';
import { GridRowClickEvent } from '@progress/kendo-vue-grid';

@Component
export default class CompanyOverview extends mixins(BaseMixin, EnumLocalizerMixin, FilterMixin, KendoTableMixin, RegistrationActionMixin)
{
    currentUserProcessesStore = useCurrentUserProcessesStore();
    companyFilters = companyFilters;

    private readonly _dossierStore = useDossierStore();

    get max() : number
    {
        return 100;
    }

    get registrationActionTypes(): WebProcessResource[]
    {
        return this.currentUserProcessesStore.companyOverview;
    }

    get companies(): CompanyListResource[]
    {
        return this._dossierStore.companies;
    }

    get companiesCount(): number
    {
        return this._dossierStore.companiesCount;
    }

    get rows(): CompanyListResource[]
    {
        return this._dossierStore.companies;
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: nameof<CompanyListResource>('name'),
            title: AppHost.i18n.global.t('Name').toString(),
            filterCell: 'filterSlotInput',
            cell: 'companyName',
            width: '200px',
            filterable: false,
            sortable: false,
            orderIndex: 0
        },
        {
            field: nameof<CompanyListResource>('address'),
            title: AppHost.i18n.global.t('Location').toString(),
            cell: 'location',
            width: '250px',
            filterable: false,
            sortable: false,
            orderIndex: 1
        },
        {
            field: nameof<CompanyListResource>('deactivateOnUtc'),
            title: AppHost.i18n.global.t('EndDateShort').toString(),
            format: this.dateFormat,
            cell: 'deactivateOnUtc',
            width: '180px',
            filterable: false,
            sortable: false,
            orderIndex: 2
        },
        {
            field: nameof<CompanyListResource>('state'),
            title: AppHost.i18n.global.t('State').toString(),
            cell: 'companyState',
            width: '150px',
            filterable: false,
            sortable: false,
            orderIndex: 3
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    getCompanyStateClassModifier(state: CompanyState): string
    {
        switch (state)
        {
            case CompanyState.Active:
                return 'active';
            case CompanyState.PendingDeactivation:
                return 'cooldown';
            case CompanyState.InActive:
                return 'inactive';
            default:
                return 'inactive';
        }
    }

    async onCompanyClick($event: GridRowClickEvent): Promise<void>
    {
        const response = await this._dossierStore.loadCompanyByIdAction($event.dataItem.companyId);

        if (response.isSuccess)
        {
            this.$router.push({
                path: YimUrls.companyDetailUrl($event.dataItem.companyId)
            });
        }
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.getCompanies();
        await this.currentUserProcessesStore.getMyProcessesAction();
    }

    @Watch('currentLocale')
    @Watch('$route.query')
    async getCompanies(): Promise<void>
    {
        const params: CompaniesFilter = new CompaniesFilter({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            companyFilter: this.$route.query.filter as unknown as CompanyFilter,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            companiesScope: CompaniesScope.Shadow
        });

        await this._dossierStore.getCompanies(params);
    }

    @Watch('currentLocale')
    async onLocaleChanged(): Promise<void>
    {
        await this.currentUserProcessesStore.getMyProcessesAction(true);
        return this.getCompanies();
    }
}
