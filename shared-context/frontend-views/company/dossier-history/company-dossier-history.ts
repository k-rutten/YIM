import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { CompanyDossierHistoryResource } from '@src/models/generated/registration';
import CompanyMixin from '@src/utils/mixins/company-mixin';

@Component
export default class CompanyDossierHistory extends mixins(BaseMixin, CompanyMixin)
{
    dossierHistory: CompanyDossierHistoryResource|null = null;

    async mounted(): Promise<void>
    {
        this.dossierHistory = await this.dossierStore.getCompanyDossierHistory(this.companyId);
    }
}
