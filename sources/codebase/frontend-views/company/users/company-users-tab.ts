import { Component, mixins, Watch } from 'vue-facing-decorator';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { useUserStore } from '@src/store/user-module';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { CompanyUsersFilterRequest, CompanyUserListResource } from '@src/models/generated/registration';
import { ToastTypes } from 'yim-common/src/models/models';
import { useToastsStore } from 'yim-common/src/store/toasts-module';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import { registrationApiService } from '@src/services';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class CompanyUsersTab extends mixins(BaseMixin, FilterMixin, KendoTableMixin, CompanyMixin)
{
    private readonly _userStore = useUserStore();
    private readonly _toastsStore = useToastsStore();

    rowToDelete: CompanyUserListResource | null = null;
    rows: CompanyUserListResource[] = [];
    totalCount = 0;

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
        this.defaultColumns = [];
        this.defaultColumns.push({
            field: nameof<CompanyUserListResource>('fullName'),
            title: AppHost.i18n.global.t('Name') as string,
            filterCell: 'filterSlotInput',
            headerClassName: getSortClass()
        },
        {
            field: nameof<CompanyUserListResource>('emailAddress'),
            title: AppHost.i18n.global.t('Email address').toString(),
            filterCell: 'filterSlotInput',
            filterable: false,
            headerClassName: getSortClass()
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    created(): void
    {
        this.setDefaultColumns();
    }

    async mounted(): Promise<void>
    {
        await this.getRows();
    }

    @Watch('$route.query')
    async getRows(): Promise<void>
    {
        const params = new CompanyUsersFilterRequest({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string,
            fullName: this.$route.query.fullName as string
        });

        const response = await registrationApiService.findCompanyUsers(this.companyId, params);
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

    @Watch('currentLocale')
    onLocaleChanged(): Promise<void>
    {
        return this.getRows();
    }

    async addRow(): Promise<void>
    {
        await this.$router.push('/user/new');
    }

    async updateRow(row: CompanyUserListResource): Promise<void>
    {
        await this.$router.push(`/user/${row.userId}`);
    }

    async deleteRow(): Promise<void>
    {
        if (this.rowToDelete === null)
        {
            return;
        }

        const response = await this._userStore.deleteUserAction(this.rowToDelete.userId);
        if (response.isSuccess)
        {
            this.rowToDelete = null;
            this._toastsStore.showToastAction({ text: AppHost.i18n.global.t('Removed user successfully').toString(), type: ToastTypes.success });
            await this.getRows();
        }
        else
        {
            this._toastsStore.showToastAction({ text: response.firstError(), type: ToastTypes.error });
        }
    }

    setRowToDelete(row: CompanyUserListResource): void
    {
        this.rowToDelete = row;
    }
}
