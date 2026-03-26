import { Component, mixins, Watch } from 'vue-facing-decorator';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { CompanyEventListResource, CompanyEventsFilterRequest, EventTypesScope } from '@src/models/generated/registration';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import { useCompanyStore } from '@src/store/company-module';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import EventTypeMixin from '@src/utils/mixins/event-type-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class CompanyEventsTab extends mixins(BaseMixin, FilterMixin, KendoTableMixin, CompanyMixin, EventTypeMixin)
{
    private readonly _companyStore = useCompanyStore();

    get events(): CompanyEventListResource[]
    {
        return this._companyStore.events;
    }

    get pageCount(): number
    {
        return Math.ceil(this._companyStore.eventsCount / this.pageSize);
    }

    get totalCount(): number
    {
        return this._companyStore.eventsCount;
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];
        this.defaultColumns.push({
            field: nameof<CompanyEventListResource>('name'),
            title: AppHost.i18n.global.t('Name') as string,
            filterCell: 'filterSlotInput',
            headerClassName: getSortClass()
        },
        {
            field: nameof<CompanyEventListResource>('eventType'),
            title: AppHost.i18n.global.t('Type').toString(),
            headerClassName: getSortClass(),
            filterCell: 'filterSlotEventType',
            width: '150px',
            orderIndex: 0
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.getEvents();
        await this.getEventTypes(EventTypesScope.InUse);
    }

    @Watch('$route.query')
    async getEvents(): Promise<void>
    {
        const params = new CompanyEventsFilterRequest({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string,
            name: this.$route.query.name as string,
            eventType: (this.$route.query.eventType as string)?.split(',')
        });

        await this._companyStore.loadCompanyEventsAction({ companyId: this.companyId, params });
    }

    @Watch('currentLocale')
    onLocaleChanged(): Promise<void>
    {
        return this.getEvents();
    }
}
