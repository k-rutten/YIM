import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { AuthorizationRuleReferenceResource, AuthorizationRulesFilter, RegistrationActionTypes } from '@src/models/generated/registration';
import { useAuthorizationRuleStore } from '@src/store/authorization-rule-module';
import { registrationApiService } from '@src/services';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import { ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    emits: ['show-notification']
})
export default class AuthorizationRulesOverview extends mixins(BaseMixin, FilterMixin, EnumLocalizerMixin, KendoTableMixin)
{
    private readonly _authorizationRuleStore = useAuthorizationRuleStore();

    authorizationRuleToDelete = '';

    get authorizationRules(): AuthorizationRuleReferenceResource[]
    {
        return this._authorizationRuleStore.authorizationRules;
    }

    get rulesCount(): number
    {
        return this._authorizationRuleStore.authorizationRulesCount;
    }

    get pageCount(): number
    {
        return Math.ceil(this._authorizationRuleStore.authorizationRulesCount / this.pageSize);
    }

    get getPageSize(): number
    {
        return this.pageSize;
    }

    created(): void
    {
        this.getAuthorizationRules();
        this.setDefaultColumns();
    }

    @Watch('$route.query')
    getAuthorizationRules(): Promise<void>
    {
        const params = new AuthorizationRulesFilter({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            isRoleOverview: true
        });

        return this._authorizationRuleStore.loadAuthorizationRulesAction(params);
    }

    @Watch('currentLocale')
    onLocaleChanged(): Promise<void>
    {
        return this.getAuthorizationRules();
    }

    formatRegistrationActionTypes(registrationActionTypes: RegistrationActionTypes[]): string
    {
        return registrationActionTypes.map((action) => this.getLocalizedRegistrationActionTypeName(RegistrationActionTypes[action])).filter((localizedName) => localizedName.length > 0).join(', ');
    }

    formatProcessDefinitionTypes(processDefinitionTypes: ProcessDefinitionTypes[]): string
    {
        return processDefinitionTypes.map((action) => this.getLocalizedProcessDefinitionTypeName(ProcessDefinitionTypes[action])).filter((localizedName) => localizedName.length > 0).join(', ');
    }

    setAuthorizationRuleToDelete(id: string): void
    {
        this.authorizationRuleToDelete = id;
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];
        this.defaultColumns.push({
            field: 'name',
            title: AppHost.i18n.global.t('Name') as string,
            width: '200px',
            sortable: false,
            filterable: false
        },
        {
            field: 'processDefinitionTypes',
            cell: 'processDefinitionTypesSlot',
            title: AppHost.i18n.global.t('Processes') as string,
            width: '200px',
            sortable: false,
            filterable: false
        },
        {
            field: 'registrationActionTypes',
            cell: 'registrationActionTypesSlot',
            title: AppHost.i18n.global.t('Process functions') as string,
            width: '200px',
            sortable: false,
            filterable: false
        },
        {
            field: 'actions',
            title: AppHost.i18n.global.t('Actions') as string,
            cell: 'authorizationRuleActions',
            width: '130px',
            headerClassName: 'k-header--right',
            sortable: false,
            filterable: false
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    async deleteAuthorizationRule(): Promise<void>
    {
        await registrationApiService.deleteAuthorizationRule(this.authorizationRuleToDelete);

        await this.getAuthorizationRules();
        this.authorizationRuleToDelete = '';
        this.$emit('show-notification', {
            text: AppHost.i18n.global.t('Removed user right successfully'),
            type: 'success' });
    }

    getRuleName(id: string): string
    {
        const rule = this.authorizationRules.find((item) => (item.authorizationRuleId === id));
        return rule ? rule.name : '';
    }
}
