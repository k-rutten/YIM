import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { personId } from '@src/utils/types/param-names';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import YimModalTabs from '@src/components/yim-dossier-modal/yim-modal-tabs/yim-modal-tabs.vue';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { ElearningInvitationState, PersonElearningInvitationResource } from '../../../../models/generated/registration';
import { PageRequest } from 'yim-common/src/models/generated/common';
import { usePersonInvitationsStore } from '@src/store/person-invitations-module';
import { useRoute } from 'vue-router';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    components: {
        'yim-modal-tabs': YimModalTabs
    }
})
export default class PersonInvitationsTable extends mixins(BaseMixin, EnumLocalizerMixin, KendoTableMixin)
{
    private readonly _personInvitationsStore = usePersonInvitationsStore();

    get personId(): string
    {
        const route = useRoute();
        return route.params[personId] as string;
    }

    get invitations(): PersonElearningInvitationResource[]
    {
        return this._personInvitationsStore.invitations;
    }

    created(): void
    {
        this.loadInvitations();
        this.setDefaultColumns();
    }

    getInvitationStateClassModifier(state: ElearningInvitationState): string
    {
        return ElearningInvitationState[state].toLowerCase();
    }

    getInvitationStateName(state: ElearningInvitationState): string
    {
        return this.getLocalizedElearningInvitationStatusName(ElearningInvitationState[state]);
    }

    @Watch('currentLocale')
    @Watch('$route.query')
    async loadInvitations(): Promise<void>
    {
        const params = new PageRequest({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string
        });

        await this._personInvitationsStore.loadInvitationsAction({ personId: this.personId, params });
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: 'name',
            title: AppHost.i18n.global.t('Name') as string,
            cell: 'name',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: 'platform',
            title: AppHost.i18n.global.t('Platform') as string,
            cell: 'platform',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: 'validUntil',
            title: AppHost.i18n.global.t('ValidUntil') as string,
            cell: 'date',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: 'state',
            title: AppHost.i18n.global.t('State') as string,
            cell: 'state',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            title: AppHost.i18n.global.t('Actions') as string,
            cell: 'actions',
            sortable: false
        });

        this.columns = cloneDeep(this.defaultColumns);
    }
}
