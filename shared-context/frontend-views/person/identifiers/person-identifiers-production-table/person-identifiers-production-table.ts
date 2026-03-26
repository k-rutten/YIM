import { Component, mixins, Prop, Watch } from 'vue-facing-decorator';
import { YimUrls } from '@src/utils/helpers/url';
import { IdentifierFilter, IdentifierListResource, IdentifierStatus, PersonDetailResource, RegistrationActionTypes } from '@src/models/generated/registration';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import cloneDeep from 'lodash/cloneDeep';
import { useUserStore } from '@src/store/user-module';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class PersonIdentifiersProductionTable extends mixins(BaseMixin, KendoTableMixin, EnumLocalizerMixin)
{
    @Prop()
    personId!: string;

    @Prop()
    person: PersonDetailResource | null;

    private readonly _userStore = useUserStore();

    get identifierRequests(): IdentifierListResource[]
    {
        return this._userStore.personIdentifierRequests;
    }

    get pageCount(): number
    {
        return this._userStore.personIdentifierRequestsCount;
    }

    getStateClassModifier(state: IdentifierStatus): string
    {
        return IdentifierStatus[state].toLowerCase();
    }

    getStateName(state: IdentifierStatus): string
    {
        return this.getLocalizedIdentifierStatusName(IdentifierStatus[state]);
    }

    created(): void
    {
        this.searchPersonIdentifiers();
        this.setDefaultColumns();
    }

    onRequestIdentifier(): void
    {
        this.$router.push({
            path: YimUrls.requestIdentifierOverviewUrl(this.personId)
        });
    }

    hasIdentifierPermission() : boolean
    {
        return this.person?.registrationActionTypes.includes(RegistrationActionTypes.RequestIdentifiers) ?? false;
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: nameof<IdentifierListResource>('credentialVariantName'),
            title: AppHost.i18n.global.t('IdentifierNameColumnLabel') as string
        });

        this.defaultColumns.push({
            field: nameof<IdentifierListResource>('identifierNumber'),
            title: AppHost.i18n.global.t('IdentificationNumber').toString(),
            className: 'person-identifiers__identification-number'
        });

        this.defaultColumns.push({
            field: nameof<IdentifierListResource>('validFrom'),
            title: AppHost.i18n.global.t('ValidFrom').toString(),
            cell: 'date'
        });

        this.defaultColumns.push({
            field: nameof<IdentifierListResource>('validTill'),
            title: AppHost.i18n.global.t('ValidUntil').toString(),
            cell: 'date'
        });

        this.defaultColumns.push({
            field: nameof<IdentifierListResource>('status'),
            title: AppHost.i18n.global.t('State').toString(),
            cell: 'state'
        });

        this.defaultColumns.push({
            field: 'actions',
            title: AppHost.i18n.global.t('Actions').toString(),
            cell: 'actions',
            width: '120px',
            headerClassName: 'k-header--right',
            sortable: false
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    updatePersonIdentifiers(): Promise<void>
    {
        return this.searchPersonIdentifiers();
    }

    @Watch('currentLocale')
    @Watch('$route.query')
    async searchPersonIdentifiers(): Promise<void>
    {
        const params = new IdentifierFilter({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.orderBy as string,
            personId: this.personId
        });

        await this._userStore.searchPersonIdentifierRequestsAction(params);
    }
}
