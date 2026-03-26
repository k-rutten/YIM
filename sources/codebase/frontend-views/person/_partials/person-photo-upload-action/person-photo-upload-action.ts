import { Component, mixins, Watch } from 'vue-facing-decorator';
import { usePhotoRuleStore } from '@src/store/photo-rule-module';
import { registrationApiService } from '@src/services';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';
import RegistrationActionMixin from '@src/utils/mixins/registration-action-mixin';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { FileType, IdentifierPhotoRuleDetailResource, ImageConfiguration } from '@src/models/generated/registration';
import { UploadFile } from 'yim-common/src/models/models';
import { FileReference } from '@src/models/generated/common';
import { HttpResponse } from 'yim-common/src/utils/helpers/http-utils';
import FileReferenceTypes from '@src/utils/types/file-reference-types';
import { useRegistrationStore } from '@src/store/registration-module';
import { usePersonDossierPhotoStore } from '@src/store/person-dossier-photo-module';
import { useDossierStore } from '@src/store/dossier-module';

@Component
export default class PersonPhotoUploadAction extends mixins(PersonDossierMixin, BaseMixin, RegistrationActionMixin)
{
    showPhotoEditor = false;
    photoConfiguration: ImageConfiguration = new ImageConfiguration();
    uploadErrors: string[] = [];
    photoBlobUrl: string | null = null;
    fileReference = FileReferenceTypes.fileReference;
    resetImage = false;
    imageIsBeingUploaded = false;

    private readonly _photoRuleStore = usePhotoRuleStore();
    private readonly _registrationStore = useRegistrationStore();
    private readonly _personDossierPhotoStore = usePersonDossierPhotoStore();
    private readonly _dossierStore = useDossierStore();

    get photoRule(): IdentifierPhotoRuleDetailResource
    {
        return this._photoRuleStore.photoRule;
    }

    openPhotoEditor(): void
    {
        this.showPhotoEditor = true;
    }

    @Watch('currentLocale')
    @Watch('showPhotoEditor')
    async getPhotoRuleInfo(): Promise<void>
    {
        if (!this.showPhotoEditor)
        {
            return;
        }

        const response = await this._photoRuleStore.loadPhotoRuleAction();
        if (!response.isSuccess)
        {
            this.showServiceError(response);
            return;
        }

        this.photoConfiguration = new ImageConfiguration({
            aspectRatio: this.photoRule.aspectRatio,
            colorScheme: this.photoRule.colorScheme,
            isEnabled: true,
            isRequired: false,
            maximumSize: this.photoRule.maximumSize,
            maximumUploadAgeInDays: this.photoRule.maxUploadAgeInDays,
            maximumUploadSizeInMb: this.photoRule.maxFileSizeInMb,
            minimumSize: this.photoRule.minimumSize,
            requiredMimeTypes: [FileType.Jpeg, FileType.Png]
        });
    }

    async uploadPhoto($event: File): Promise<void>
    {
        if ($event && this.showPhotoEditor && !!$event.size)
        {
            this.imageIsBeingUploaded = true;
            const imageUploadResponse: HttpResponse<FileReference> = await registrationApiService.uploadPersonPhoto(new UploadFile(`persons/${this.personId}/photos`, $event), this.personId);

            if (imageUploadResponse.isSuccess)
            {
                this.imageIsBeingUploaded = false;
                this.clearErrors();
                this.showServiceSuccess('ImageIsUploaded');
            }
            else if (!imageUploadResponse.isSuccess && imageUploadResponse.firstError())
            {
                this.imageIsBeingUploaded = false;
                this.clearErrors();
                this.uploadErrors = Object.values(imageUploadResponse.errors).flatMap((error) => error);
                this.showError(imageUploadResponse.firstError());
            }
        }
    }

    clearErrors(): void
    {
        this.uploadErrors = [];
    }

    async closePhotoEditor(fetchPhotoData = false): Promise<void>
    {
        this.showPhotoEditor = false;

        if (fetchPhotoData)
        {
            await this._personDossierPhotoStore.loadPersonDossierPhoto(this.personId);
            this._dossierStore.removeCurrentPersonMutation();
            await this._dossierStore.loadPersonByIdAction(this.personId);
        }
    }

    unmounted(): void
    {
        this._registrationStore.clearImageAction();
    }
}
