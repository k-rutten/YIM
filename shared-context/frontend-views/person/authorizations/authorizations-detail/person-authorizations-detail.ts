import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import { personId } from '@src/utils/types/param-names';
import { DossierAccessLevels } from '@src/models/generated/registration';
import { useDossierStore } from '@src/store/dossier-module';
import RegistrationActionMixin from '@src/utils/mixins/registration-action-mixin';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';

@Component
export default class PersonAuthorizationsDetail extends mixins(BaseMixin, FilterMixin, RegistrationActionMixin, PersonDossierMixin)
{
    private readonly _dossierStore = useDossierStore();

    get personId(): string
    {
        return this.$route.params[personId] as string;
    }

    get personPeriodOfAccess(): Date | null
    {
        return this._dossierStore.currentPerson?.periodOfAccessTo ?? null;
    }

    hasHistory(): boolean
    {
        return this._dossierStore.currentPerson?.dossierAccessLevels.includes(DossierAccessLevels.History) ?? false;
    }
}
