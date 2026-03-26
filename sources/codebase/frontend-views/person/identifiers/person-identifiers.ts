import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { personId } from '@src/utils/types/param-names';
import {
    PersonDetailResource, RegistrationActionTypes
} from '@src/models/generated/registration';
import { useDossierStore } from '@src/store/dossier-module';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import personIdentifiersProductionTable from './person-identifiers-production-table/person-identifiers-production-table.vue';
import personIdentifiersRequestTable from './person-identifiers-request-table/person-identifiers-request-table.vue';
import tableHeader from '@src/components/table-header/table-header.vue';
import { YimUrls } from '@src/utils/helpers/url';

@Component({
    components: {
        personIdentifiersProductionTable,
        personIdentifiersRequestTable,
        tableHeader
    }
})
export default class PersonIdentifiers extends mixins(BaseMixin, FilterMixin, KendoTableMixin, EnumLocalizerMixin)
{
    productionTable = true;
    private readonly _dossierStore = useDossierStore();

    get person(): PersonDetailResource | null
    {
        return this._dossierStore.currentPerson;
    }

    get personId(): string
    {
        return this.$route.params[personId] as string;
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
}
