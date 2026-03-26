import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { useDossierStore } from '@src/store/dossier-module';
import { personId } from '@src/utils/types/param-names';
import { PersonDossierHistoryResource } from '@src/models/generated/registration';

@Component
export default class PersonDossierHistory extends mixins(BaseMixin)
{
    private readonly _dossierStore = useDossierStore();
    dossierHistory: PersonDossierHistoryResource|null = null;

    async mounted(): Promise<void>
    {
        this.dossierHistory = await this._dossierStore.getPersonDossierHistory(this.personId);
    }

    get personId(): string
    {
        return this.$route.params[personId] as string;
    }
}
