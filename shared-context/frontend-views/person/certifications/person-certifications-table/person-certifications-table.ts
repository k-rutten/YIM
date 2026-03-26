import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { personId } from '@src/utils/types/param-names';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import YimModalTabs from '@src/components/yim-dossier-modal/yim-modal-tabs/yim-modal-tabs.vue';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import cloneDeep from 'lodash/cloneDeep';
import { CertificateState, PersonCertificateResource } from '../../../../models/generated/registration';
import { PageRequest } from 'yim-common/src/models/generated/common';
import { usePersonCertificatesStore } from '@src/store/person-certifications-module';
import { useRoute } from 'vue-router';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    components: {
        'yim-modal-tabs': YimModalTabs
    }
})
export default class PersonCertificationsTable extends mixins(BaseMixin, EnumLocalizerMixin, KendoTableMixin)
{
    private readonly _personCertificatesStore = usePersonCertificatesStore();

    get personId(): string
    {
        const route = useRoute();
        return route.params[personId] as string;
    }

    get certificates(): PersonCertificateResource[]
    {
        return this._personCertificatesStore.certificates;
    }

    created(): void
    {
        this.loadCertificates();
        this.setDefaultColumns();
    }

    getCertificateStateClassModifier(state: CertificateState): string
    {
        return CertificateState[state].toLowerCase();
    }

    getCertificateStateName(state: CertificateState): string
    {
        return this.getLocalizedCertificateStatusName(CertificateState[state]);
    }

    @Watch('currentLocale')
    @Watch('$route.query')
    async loadCertificates(): Promise<void>
    {
        const params = new PageRequest({
            search: this.$route.query.search as string,
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string
        });

        await this._personCertificatesStore.loadCertificatesAction({ personId: this.personId, params });
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: 'name',
            title: AppHost.i18n.global.t('CertificationNameColumnLabel') as string,
            cell: 'name',
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

        this.columns = cloneDeep(this.defaultColumns);
    }
}
