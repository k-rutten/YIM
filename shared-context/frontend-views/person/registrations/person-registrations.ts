import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import {
    RegistrationListResource,
    RegistrationState
} from '@src/models/generated/registration';
import { useDossierStore } from '@src/store/dossier-module';
import { personId } from '@src/utils/types/param-names';
import { YimUrls } from '@src/utils/helpers/url';
import { ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';
import { FeatureFlag, FeatureFlags } from '@src/utils/feature-flags';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class PersonRegistrations extends mixins(BaseMixin, PersonDossierMixin)
{
    processDefinitionType = ProcessDefinitionTypes;
    private readonly _dossierStore = useDossierStore();

    get registrations(): RegistrationListResource[]
    {
        return this._dossierStore?.currentPerson?.registrations ?? [];
    }

    getStateClassModifier(state: RegistrationState): string
    {
        return RegistrationState[state].toLowerCase();
    }

    hasAuthorizationsStepOne(source: RegistrationListResource): boolean
    {
        return source.processDefinitionType !== ProcessDefinitionTypes.CompanyRegistration &&
            (source.authorizationAccreditationStateStepOne.approvedCount +
                source.authorizationAccreditationStateStepOne.rejectedCount) > 0;
    }

    hasAuthorizationsStepTwo(source: RegistrationListResource): boolean
    {
        return this.twoStepAccreditationColumnEnabled(source) &&
            source.processDefinitionType !== ProcessDefinitionTypes.CompanyRegistration &&
            (source.authorizationAccreditationStateStepTwo.approvedCount +
                source.authorizationAccreditationStateStepTwo.rejectedCount) > 0;
    }

    twoStepAccreditationColumnEnabled(source: RegistrationListResource) : boolean
    {
        return FeatureFlags.hasFeature(FeatureFlag.EnableAccessRuleTwoStepAccreditation) &&
            source.processDefinitionType === ProcessDefinitionTypes.EmployeeRegistration;
    }

    getAuthorizationTitle(source: RegistrationListResource) : string
    {
        return this.twoStepAccreditationColumnEnabled(source) ?
            AppHost.i18n.global.t('ResultAuthorizationStepOne') as string :
            AppHost.i18n.global.t('Result authorization') as string;
    }

    async onRegistrationClick(entry: RegistrationListResource): Promise<void>
    {
        await this.$router.push({
            path: YimUrls.registrationDetailUrl(entry.registrationId, entry.startStepNumber)
        });
    }

    get personId(): string
    {
        return this.$route.params[personId] as string;
    }

    async onSideBarRegistrationClick(processId: number): Promise<void>
    {
        await this.$router.push({
            path: YimUrls.registrationStartUrl(processId),
            query: { personId: this.personId }
        });
    }
}
