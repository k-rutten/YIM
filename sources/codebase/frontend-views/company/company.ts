import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { CompanyState, DossierAccessLevels } from '@src/models/generated/registration';
import { YimUrls } from '@src/utils/helpers/url';
import { TabBarLink } from 'yim-common/src/models/models';
import { formatYimDate } from 'yim-common/src/utils/filters/dates/format';
import CompanyMixin from '@src/utils/mixins/company-mixin';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class Company extends mixins(BaseMixin, CompanyMixin)
{
    entityFound: boolean | null = null;
    companyStateInactive = CompanyState.InActive;

    get description(): string
    {
        let description = '';
        description += this.company?.address?.streetAddress ? `${this.company?.address?.streetAddress}` : '';
        description += this.company?.address?.postalCode ? `, ${this.company?.address?.postalCode}`: '';
        description += this.company?.address?.locality ? `, ${this.company?.address?.locality}`: '';
        description += this.company?.country ? `, ${this.company?.country}`: '';
        description += this.company?.chamberOfCommerceNumber ? ` ● ${ this.company.chamberOfCommerceNumber}` : '';
        description += this.company?.vatRegistrationNumber ? ` ● ${ this.company.vatRegistrationNumber}` : '';

        return description;
    }

    get formattedModificationDate(): string
    {
        return formatYimDate(this.company?.modifiedOnUtc, this.dayMonthYearTimeFormat);
    }

    get companiesUrl(): string
    {
        return YimUrls.companiesUrl();
    }

    get links(): TabBarLink[]
    {
        const links = [
            new TabBarLink({
                label: AppHost.i18n.global.t('Dossier').toString(),
                url: YimUrls.companyDetailDossierUrl(this.companyId)
            })
        ];

        if (!this.company.isShadow && this.company?.dossierAccessLevels.includes(DossierAccessLevels.Registrations))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Registrations').toString(),
                url: YimUrls.companyDetailRegistrationsUrl(this.companyId)
            }));
        }

        if (this.company?.dossierAccessLevels.includes(DossierAccessLevels.Persons))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Persons')
                    .toString(),
                url: YimUrls.companyDetailPersonsUrl(this.companyId)
            }));
        }

        if (!this.company.isShadow && this.company?.dossierAccessLevels.includes(DossierAccessLevels.Users))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Users').toString(),
                url: YimUrls.companyDetailUsersUrl(this.companyId)
            }));
        }

        if (!this.company.isShadow && this.company?.dossierAccessLevels.includes(DossierAccessLevels.History))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('History').toString(),
                url: YimUrls.companyDetailDossierHistoryUrl(this.companyId)
            }));
        }

        if (!this.company.isShadow && this.company?.dossierAccessLevels.includes(DossierAccessLevels.Events))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Events').toString(),
                url: YimUrls.companyDetailEventsUrl(this.companyId)
            }));
        }

        return links;
    }

    beforeDestroy(): void
    {
        this.dossierStore.resetCurrentCompanyAction();
    }

    async created(): Promise<void>
    {
        const response = await this.dossierStore.loadCompanyByIdAction(this.companyId);
        this.entityFound = response.isSuccess;
    }

    @Watch('currentLocale')
    async onLocaleChanged(): Promise<void>
    {
        await this.dossierStore.loadCompanyByIdAction(this.companyId);
    }
}
