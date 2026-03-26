import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import {
    RegistrationActionTypes,
    RegistrationListResource,
    RegistrationState,
    WebPermission
} from '@src/models/generated/registration';
import { YimUrls } from '@src/utils/helpers/url';
import { ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import { useCurrentUserStore } from '@src/store/current-user-module';

@Component
export default class CompanyRegistrations extends mixins(BaseMixin, CompanyMixin)
{
    showDeactivationModal = false;
    showReactivationModal = false;
    hasCompanyDeactivatePermission = useCurrentUserStore().permissions.includes(WebPermission.AdminAccessDeactivateCompanies);
    hasCompanyReactivatePermission = useCurrentUserStore().permissions.includes(WebPermission.AdminAccessReactivateCompanies);

    processDefinitionTypes = ProcessDefinitionTypes;

    get registrations(): RegistrationListResource[]
    {
        return this.dossierStore.currentCompany?.registrations ?? [];
    }

    getStateClassModifier(state: RegistrationState): string
    {
        return RegistrationState[state].toLowerCase();
    }

    async onRegistrationDetailClick(entry: RegistrationListResource) : Promise<void>
    {
        await this.$router.push({
            path: YimUrls.registrationDetailUrl(entry.registrationId, entry.startStepNumber)
        });
    }

    async onRegistrationClick(processId: number, registrationActionType: RegistrationActionTypes): Promise<void>
    {
        if (registrationActionType === RegistrationActionTypes.Deactivate)
        {
            this.showDeactivationModal = true;
        }
        else if (registrationActionType === RegistrationActionTypes.Reactivate)
        {
            this.showReactivationModal = true;
        }
        else
        {
            await this.$router.push({
                path: YimUrls.registrationStartUrl(processId),
                query: { companyId: this.companyId }
            });
        }
    }

    close(): void
    {
        this.showDeactivationModal = false;
        this.showReactivationModal = false;
    }
}
