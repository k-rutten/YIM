import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import {
    ArchiveState,
    AuthorizationListResource,
    AuthorizationsFilter,
    AuthorizationsScope
} from '@src/models/generated/registration';
import { useAuthorizationStore } from '@src/store/authorization-module';
import { registrationApiService } from '@src/services';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import { GridRowClickEvent } from '@progress/kendo-vue-grid';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import ProcessMixin from '@src/utils/mixins/process-mixin';
import { ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import AuthorizationMixin from '@src/utils/mixins/authorization-mixin';
import { ISelectListData } from 'yim-common/src/models/models';
import { YimUrls } from '@src/utils/helpers/url';
import cloneDeep from 'lodash/cloneDeep';
import FormatMixin from '@src/utils/mixins/format-mixin';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class AuthorizationOverview extends mixins(BaseMixin, FilterMixin, EnumLocalizerMixin, KendoTableMixin, ProcessMixin, AuthorizationMixin, FormatMixin)
{
    private readonly _authorizationStore = useAuthorizationStore();

    authorizationToDelete = '';

    get authorizations(): AuthorizationListResource[]
    {
        return this._authorizationStore.authorizations;
    }

    get dateTimeScheduleOptions(): ISelectListData[]
    {
        return this.dateTimeSchedules.map((dateTimeSchedule) => ({ id: dateTimeSchedule.dateTimeScheduleId, name: dateTimeSchedule.name }));
    }

    get processDefinitionScheduleOptions(): ISelectListData[]
    {
        return this.processDefinitionTypeDataSource.map((type) => ({
            id: (type.value ?? ProcessDefinitionTypes.None).toString(),
            name: type.text
        }) as ISelectListData);
    }

    get zoneOptions(): ISelectListData[]
    {
        return this.zones.map((zone) => ({ id: zone.zoneId, name: zone.name }));
    }

    get authorizationsCount(): number
    {
        return this._authorizationStore.authorizationsCount;
    }

    get pageCount(): number
    {
        return Math.ceil(this.authorizationsCount / this.pageSize);
    }

    get getPageSize(): number
    {
        return this.pageSize;
    }

    getAuthorizationName(id: string): string
    {
        const authorization = this.authorizations.find((item) => (item.authorizationId === id));
        return authorization ? authorization.name : '';
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.getInitialData();
        await this.loadAuthorizations();
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: nameof<AuthorizationListResource>('name'),
            title: AppHost.i18n.global.t('Name') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotInput',
            width: '150px',
            orderIndex: 1
        },
        {
            field: nameof<AuthorizationListResource>('locations'),
            title: AppHost.i18n.global.t('Locations') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotLocations',
            width: '150px',
            orderIndex: 2,
            cell: 'location-tag'
        },
        {
            field: nameof<AuthorizationListResource>('zones'),
            title: AppHost.i18n.global.t('Zone') as string,
            filterCell: 'filterSlotZones',
            width: '150px',
            orderIndex: 3,
            cell: 'zones-tag',
            sortable: false
        },
        {
            field: nameof<AuthorizationListResource>('dateTimeSchedule'),
            title: AppHost.i18n.global.t('Date time schedule') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotDateTimeSchedules',
            width: '150px',
            orderIndex: 4,
            cell: 'dateTimeSchedule-tag'
        },
        {
            field: nameof<AuthorizationListResource>('processDefinitionTypes'),
            title: AppHost.i18n.global.t('Processes') as string,
            cell: 'type',
            width: '170px',
            sortable: false,
            filterCell: 'filterSlotAuthorizationType',
            filterable: true,
            orderIndex: 5
        },
        {
            field: nameof<AuthorizationListResource>('state'),
            title: AppHost.i18n.global.t('State') as string,
            headerClassName: getSortClass(),
            filterCell: 'filterSlotArchiveState',
            cell: 'archive-state',
            width: '150px',
            orderIndex: 6
        },
        {
            field: 'actions',
            title: AppHost.i18n.global.t('Actions') as string,
            cell: 'authorization-actions',
            width: '130px',
            headerClassName: 'k-header--right',
            sortable: false,
            filterable: false,
            orderIndex: 7
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    getTypeName(type: ProcessDefinitionTypes): string
    {
        return this.getLocalizedProcessDefinitionTypeName(ProcessDefinitionTypes[type]);
    }

    getStateName(state: ArchiveState): string
    {
        return this.getLocalizedArchiveStateName(ArchiveState[state]);
    }

    getStateClassModifier(state: ArchiveState): string
    {
        return ArchiveState[state].toLowerCase();
    }

    async deleteAuthorization(): Promise<void>
    {
        const response = await registrationApiService.deleteAuthorization(this.authorizationToDelete);

        if (response.isSuccess)
        {
            await this.loadAuthorizations();
            this.authorizationToDelete = '';
            this.showServiceSuccess('Removed access rule successfully');
        }
        else
        {
            this.showServiceError(response);
        }
    }

    @Watch('$route.query')
    async loadAuthorizations(): Promise<void>
    {
        const params = new AuthorizationsFilter({
            search: this.$route.query.name as string,
            locations: (this.$route.query.location as string)?.split(',') as unknown as string[],
            dateTimeSchedules: (this.$route.query.dateTimeSchedules as string)?.split(',') as unknown as string[],
            zones: (this.$route.query.zones as string)?.split(',') as unknown as string[],
            processDefinitionTypes: this.parseQueryEnumFilter<ProcessDefinitionTypes>(ProcessDefinitionTypes, nameof<AuthorizationListResource>('processDefinitionTypes')),
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string,
            states: this.parseQueryEnumFilter<ArchiveState>(ArchiveState, 'archiveStates'),
            authorizationsScope: AuthorizationsScope.AuthorizationManagement
        });

        await this._authorizationStore.loadAuthorizationsAction(params);
    }

    @Watch('currentLocale')
    onLocaleChanged(): Promise<void>
    {
        return this.loadAuthorizations();
    }

    onRowClick($event: GridRowClickEvent): Promise<any>
    {
        return this.editAuthorization($event.dataItem.authorizationId);
    }

    async onDelete($event: Event, authorizationId: string): Promise<void>
    {
        $event.stopPropagation();
        this.authorizationToDelete = authorizationId;
    }

    async onArchive($event: Event, authorizationId: string): Promise<void>
    {
        $event.stopPropagation();
        this.authorizationToDelete = authorizationId;
    }

    async onUnArchive($event: Event, authorizationId: string): Promise<void>
    {
        $event.stopPropagation();
        this.authorizationToDelete = authorizationId;
    }

    editAuthorization(authorizationId: string): Promise<any>
    {
        return this.$router.push(`/authorization/update/${authorizationId}`);
    }

    newAuthorization(): Promise<any>
    {
        return this.$router.push(YimUrls.newAuthorizationUrl());
    }
}
