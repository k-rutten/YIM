import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { YimUrls } from '@src/utils/helpers/url';
import { FormSectionResource, RegistrationActionTypes, WebPermission } from '@src/models/generated/registration';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import { DataComponentMode } from '@src/models/models';
import { useCurrentUserStore } from '@src/store/current-user-module';

@Component
export default class CompanyDossier extends mixins(BaseMixin, CompanyMixin)
{
    showDeactivationModal = false;
    showReactivationModal = false;
    showExternalAccreditModal = false;

    hasCompanyDeactivatePermission = useCurrentUserStore().permissions.includes(WebPermission.AdminAccessDeactivateCompanies);
    hasCompanyReactivatePermission = useCurrentUserStore().permissions.includes(WebPermission.AdminAccessReactivateCompanies);

    get dataComponentMode(): DataComponentMode
    {
        return DataComponentMode.DossierView;
    }

    get hasExternalAccreditation(): boolean
    {
        return this.company?.registrationActionTypes.includes(RegistrationActionTypes.AccreditExternal) ?? false;
    }

    get sections(): FormSectionResource[]
    {
        return this.dossierStore.currentCompany?.dossier.sections ?? [];
    }

    onExternalAccreditClick(): void
    {
        this.showExternalAccreditModal = true;
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
        this.showExternalAccreditModal = false;
    }
}
