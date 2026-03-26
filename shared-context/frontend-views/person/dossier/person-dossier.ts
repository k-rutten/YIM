import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { useDossierStore } from '@src/store/dossier-module';
import { FormSectionResource } from '@src/models/generated/registration';
import RegistrationActionMixin from '@src/utils/mixins/registration-action-mixin';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';
import { DataComponentMode } from '@src/models/models';
import PhotoRequirementsModal from '@src/views/request-identifier/_partials/photo-requirements-modal';
import PersonPhotoUploadAction from '@src/views/person/_partials/person-photo-upload-action/person-photo-upload-action.vue';
import PersonSyncAction from '@src/views/person/_partials/person-sync-action/person-sync-action.vue';

@Component({
    components: { PhotoRequirementsModal, PersonPhotoUploadAction, PersonSyncAction }
})
export default class PersonDossier extends mixins(BaseMixin, RegistrationActionMixin, PersonDossierMixin)
{
    private readonly _dossierStore = useDossierStore();

    get dataComponentMode(): DataComponentMode
    {
        return DataComponentMode.DossierView;
    }

    get sections(): FormSectionResource[]
    {
        return this._dossierStore.currentPerson?.dossier.sections ?? [];
    }
}
