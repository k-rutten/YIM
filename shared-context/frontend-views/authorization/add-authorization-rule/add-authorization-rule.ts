import { Component, mixins } from 'vue-facing-decorator';
import YimSidebarSteps from 'yim-common/src/components/yim-sidebar-steps/yim-sidebar-steps.vue';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import AuthorizationRuleMixin from '@src/utils/mixins/authorization-rule-mixin';
import { AddAuthorizationRuleRequest, RegistrationActionTypes } from '@src/models/generated/registration';
import { registrationApiService } from '@src/services';
import ProcessMixin from '@src/utils/mixins/process-mixin';
import { YimUrls } from '@src/utils/helpers/url';
import { Form } from 'vee-validate';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    components: {
        'yim-sidebar-steps': YimSidebarSteps,
        Form
    }
})

export default class AddAuthorizationRule extends mixins(BaseMixin, FilterMixin, AuthorizationRuleMixin, ProcessMixin)
{
    form: AddAuthorizationRuleRequest = new AddAuthorizationRuleRequest();
    get steps(): string[]
    {
        return [
            AppHost.i18n.global.t('Information').toString(),
            AppHost.i18n.global.t('Processrights').toString(),
            AppHost.i18n.global.t('Views').toString(),
            AppHost.i18n.global.t('Reports').toString(),
            AppHost.i18n.global.t('Permissions').toString(),
            AppHost.i18n.global.t('Companies').toString()];
    }

    async created(): Promise<void>
    {
        const response = await this.getInitialData();
        if (response && !response.isSuccess)
        {
            this.showServiceError(response);
            await this.goBack();
        }
    }

    requireAuthorizationTags(): boolean
    {
        const actionTypes = [RegistrationActionTypes.Register,
            RegistrationActionTypes.EditAuthorizations,
            RegistrationActionTypes.EditDossiers,
            RegistrationActionTypes.AccreditAuthorizations];
        return this.form.processDefinitionTypes.length > 0 && this.form.registrationActionTypes.some((registrationType) => actionTypes.includes(registrationType));
    }

    async addAuthorizationRule(): Promise<void>
    {
        this.disableActionButton();
        this.form.permissions = this.selectedPermissions.concat(this.selectedViews).concat(this.selectedReports);
        this.form.companies = this.selectedCompanies.map((selectedCompany) => selectedCompany.id);

        const validationResult = await this.validate();
        if (!validationResult.valid)
        {
            this.enableActionButton();
            return;
        }

        const response = await registrationApiService.addAuthorizationRule(this.form);
        if (response.isSuccess)
        {
            this.showServiceSuccess('User right has been created');
            await this.goBack();
        }
        else
        {
            this.showServiceError(response);
        }

        this.enableActionButton();
    }

    goBack(): Promise<any>
    {
        return this.$router.push(YimUrls.getAuthorizationRulesOverviewUrl());
    }
}
