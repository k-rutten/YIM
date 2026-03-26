import { Component, mixins, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { PersonRoleType } from '@src/models/generated/process-definitions';
import { DossierAccessLevels, PersonDetailResource } from '@src/models/generated/registration';
import { TabBarLink } from 'yim-common/src/models/models';
import { YimUrls } from '@src/utils/helpers/url';
import { useNavigationStore } from '@src/store/navigation-module';
import { formatYimDate } from 'yim-common/src/utils/filters/dates/format';
import { formatDate } from '@progress/kendo-intl';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import { HttpResponse } from 'yim-common/src/utils/helpers/http-utils';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component
export default class Person extends mixins(BaseMixin, EnumLocalizerMixin, PersonDossierMixin)
{
    entityFound: boolean | null = null;
    navigationStore = useNavigationStore();

    get person(): PersonDetailResource | null
    {
        return this.dossierStore.currentPerson;
    }

    get formattedModificationDate(): string
    {
        return formatYimDate(this.person?.modifiedOnUtc, this.dayMonthYearTimeFormat);
    }

    get period(): string
    {
        if (this.person?.periodOfAccessFrom === null && this.person?.periodOfAccessTo === null)
        {
            return '';
        }

        let from = '';
        if (this.person !== null && this.person.periodOfAccessFrom !== null)
        {
            from = formatDate(this.person.periodOfAccessFrom, this.dateFormat);
        }

        let to = '';
        if (this.person !== null && this.person.periodOfAccessTo !== null)
        {
            to = formatDate(this.person.periodOfAccessTo, this.dateFormat);
        }

        return `${AppHost.i18n.global.t('Period of access')}:
        ${from}
        ${AppHost.i18n.global.t('UpTo')}
        ${to}`;
    }

    get phoneNumber(): string | null
    {
        const phoneNumber = this.person?.phoneNumber;
        if (!phoneNumber)
        {
            return null;
        }

        return `+${phoneNumber.countryCode} ${phoneNumber.nationalNumber}`;
    }

    get role(): string
    {
        return this.getLocalizedPersonRoleTypeName(this.person?.role ?? PersonRoleType.Visitor);
    }

    get personnelNumber(): string
    {
        return this.person?.personnelNumber ?? '';
    }

    get backUrl(): string
    {
        return this.navigationStore.backRoute;
    }

    get links(): TabBarLink[]
    {
        const links: TabBarLink[] = [];

        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.Text))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Dossier').toString(),
                url: YimUrls.personDetailDossierUrl(this.personId)
            }));
        }

        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.Authorizations))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Authorizations').toString(),
                url: YimUrls.personDetailAuthorizationsUrl(this.personId)
            }));
        }
        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.Registrations))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Registrations').toString(),
                url: YimUrls.personDetailRegistrationsUrl(this.personId)
            }));
        }
        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.History))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('History').toString(),
                url: YimUrls.personDetailDossierHistoryUrl(this.personId)
            }));
        }

        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.Identifiers))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Identifiers').toString(),
                url: YimUrls.personDetailIdentifiersUrl(this.personId)
            }));
        }

        if (this.person?.dossierAccessLevels.includes(DossierAccessLevels.Certificates))
        {
            links.push(new TabBarLink({
                label: AppHost.i18n.global.t('Certifications').toString(),
                url: YimUrls.personDetailCertificationsUrl(this.personId)
            }));
        }

        return links;
    }

    async mounted(): Promise<void>
    {
        await this.loadPerson();

        await this.goToWhenDifferent(this.links[0].url);
    }

    @Watch('$route.query')
    async loadPerson(): Promise<void>
    {
        const response: HttpResponse<PersonDetailResource> = await this.dossierStore.loadPersonByIdAction(this.personId);

        this.entityFound = response.isSuccess;

        await this.fetchPersonDossierPhoto();
    }

    async fetchPersonDossierPhoto(): Promise<void>
    {
        await this.personDossierPhotoStore.loadPersonDossierPhoto(this.personId);
    }

    @Watch('currentLocale')
    async onLocaleChanged(): Promise<void>
    {
        await this.dossierStore.loadPersonByIdAction(this.personId);
    }

    unmounted(): void
    {
        this.personDossierPhotoStore.clearPersonDossierPhoto();
    }
}
