import { Component, mixins } from 'vue-facing-decorator';
import YimSidebarSteps from 'yim-common/src/components/yim-sidebar-steps/yim-sidebar-steps.vue';
import { SelectModalItem } from 'yim-common/src/models/models';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import AuthorizationRuleMixin from '@src/utils/mixins/authorization-rule-mixin';
import {
    RegistrationActionTypes,
    UpdateAuthorizationRuleRequest
} from '@src/models/generated/registration';
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
export default class UpdateAuthorizationRule extends mixins(BaseMixin, FilterMixin, AuthorizationRuleMixin, ProcessMixin)
{
    form: UpdateAuthorizationRuleRequest = new UpdateAuthorizationRuleRequest();
    authorizationRuleFound: boolean|null = null;

    get authorizationRuleId(): string
    {
        return this.$route.params.authorizationRuleId as string;
    }

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
        // First fetch rule itself, since that has the least overhead.
        const ruleResponse = (await registrationApiService.getAuthorizationRule(this.authorizationRuleId));
        if (!ruleResponse.isSuccess)
        {
            this.authorizationRuleFound = false;
            this.showServiceError(ruleResponse);
            return;
        }

        // Next fetch all other data we need.
        const response = await this.getInitialData();
        if (response && !response.isSuccess)
        {
            this.showServiceError(response);
            await this.goBack();
            return;
        }

        // All data is present, prepare for rendering.
        this.form = new UpdateAuthorizationRuleRequest({
            name: ruleResponse.data.name,
            description: ruleResponse.data.description,
            allowRoleDelegation: ruleResponse.data.allowRoleDelegation,
            accreditAllCompanies: ruleResponse.data.accreditAllCompanies,
            locations: ruleResponse.data.locations.map((location) => location.locationId),
            dateTimeSchedules: ruleResponse.data.dateTimeSchedules.map((dateTimeSchedule) => dateTimeSchedule.dateTimeScheduleId),
            processDefinitionTypes: ruleResponse.data.processDefinitionTypes,
            registrationActionTypes: ruleResponse.data.registrationActionTypes,
            companyAccessLevel: ruleResponse.data.companyAccessLevel,
            dossierAccessLevels: ruleResponse.data.dossierAccessLevels,
            fileAccessLevels: ruleResponse.data.fileAccessLevels,
            zones: ruleResponse.data.zones.map((zone) => zone.zoneId),
            reports: ruleResponse.data.reports.map((report) => report.reportId),
            companies: ruleResponse.data.companies.map((company) => company.companyId),
            contractorTypes: ruleResponse.data.contractorTypes.map((contractorType) => contractorType.id)
        });

        this.selectedPermissions = ruleResponse.data.permissions;
        this.selectedViews = ruleResponse.data.views;
        this.selectedReports = ruleResponse.data.legacyReports;
        this.selectedCompanies = ruleResponse.data.companies.map((item) => new SelectModalItem({
            selected: false,
            id: item.companyId,
            name: item.name
        }));
        this.authorizationRuleFound = true;
    }

    requireAuthorizationTags(): boolean
    {
        const actionTypes = [RegistrationActionTypes.Register, RegistrationActionTypes.EditAuthorizations,
            RegistrationActionTypes.EditDossiers, RegistrationActionTypes.AccreditAuthorizations];
        return this.form.processDefinitionTypes.length > 0 && this.form.registrationActionTypes.some((registrationActionType) => actionTypes.includes(registrationActionType));
    }

    async updateAuthorizationRule(): Promise<void>
    {
        this.disableActionButton();
        const validationResult = await this.validate();
        if (!validationResult.valid)
        {
            this.enableActionButton();
            return;
        }

        this.form.permissions = this.selectedPermissions.concat(this.selectedViews).concat(this.selectedReports);
        this.form.companies = this.selectedCompanies.map((c) => c.id);

        const response = await registrationApiService.updateAuthorizationRule(this.authorizationRuleId, this.form);
        if (response.isSuccess)
        {
            this.showServiceSuccess('User right has been updated');
            await this.goBack();
        }
        else
        {
            this.showServiceError(response);
            this.enableActionButton();
        }
    }

    goBack()
    {
        this.$router.push(YimUrls.getAuthorizationRulesOverviewUrl());
    }
}
