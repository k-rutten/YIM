import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { personId } from '@src/utils/types/param-names';
import RegistrationActionMixin from '@src/utils/mixins/registration-action-mixin';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';

@Component
export default class PersonAuthorizations extends mixins(BaseMixin, FilterMixin, RegistrationActionMixin, PersonDossierMixin)
{
    get personId(): string
    {
        return this.$route.params[personId] as string;
    }
}
