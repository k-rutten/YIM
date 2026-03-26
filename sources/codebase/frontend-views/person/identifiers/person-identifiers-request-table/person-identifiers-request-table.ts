import { Component, mixins, Prop, Watch } from 'vue-facing-decorator';
import {
    IdentifierFilter,
    CredentialTechnologyType,
    IdentifierRequestCandidateListResource,
    CredentialRequestWorkflowState,
    PersonDetailResource
} from '@src/models/generated/registration';
import { nameof } from 'yim-common/src/utils/helpers/nameof';
import cloneDeep from 'lodash/cloneDeep';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import KendoTableMixin from '@src/utils/mixins/kendo-table-mixin';
import BaseMixin from '@src/utils/mixins/base-mixin';
import * as paginationOptions from '@src/utils/types/pagination-options';
import { useIdentifierRequestStore } from '@src/store/identifier-request-module';
import { getSortClass } from '@src/utils/helpers/kendo-ui';
import identifierActions from './../_partials/identifier-actions.vue';
import identifierRequestStateModal from '@src/views/identifier/_partials/identifier-request-state-modal.vue';
import { AppHost } from 'yim-common/src/abstractions/app-host';

export class RequestIdentifierPersonDetails
{
    constructor(init?: Partial<RequestIdentifierPersonDetails>)
    {
        Object.assign(this, init);
    }

    fullName: string | null = null;
    role: string | null = null;
    emailAddress: string | null = null;
    phoneNumber: string | null = null;
    companyName: string | null = null;
}

@Component({
    components: {
        identifierRequestStateModal,
        identifierActions
    }
})
export default class PersonIdentifiersRequestTable extends mixins(BaseMixin, KendoTableMixin, EnumLocalizerMixin)
{
    @Prop()
    personId!: string;

    @Prop()
    person: PersonDetailResource | null;

    identifierRequestWorkflowState = CredentialRequestWorkflowState;
    showDetailModal = false;
    showIdentifierRequestId: number | null = null;

    private readonly _identifierRequestStore = useIdentifierRequestStore();

    get userProfileId(): string
    {
        return this.currentUserProfileStore.userId;
    }

    get title(): string
    {
        return AppHost.i18n.global.t('RequestIdentifierTitle').toString();
    }

    get description(): string
    {
        return AppHost.i18n.global.t('RequestIdentifierDescription').toString();
    }

    get identifiers(): IdentifierRequestCandidateListResource[] | null
    {
        return this._identifierRequestStore.identifierRequestCandidateList;
    }

    get totalItems(): number
    {
        return this._identifierRequestStore.identifierRequestCandidateListCount;
    }

    getIdentifierRequestDate(item: IdentifierRequestCandidateListResource): Date | null
    {
        return item.identifierRequestSubmittedOnUtc ?? item.identifierRequestCreatedOnUtc;
    }

    get bulletPoints(): string[]
    {
        const bulletPoints: string[] = [];

        if (!this.person)
        {
            return [];
        }

        const personDetail = new RequestIdentifierPersonDetails({
            fullName: this.person.fullName,
            role: this.getLocalizedPersonRoleTypeName(this.person.role),
            emailAddress: this.person.emailAddress,
            phoneNumber: this.person.phoneNumber ? `+ ${this.person.phoneNumber?.countryCode} ${this.person.phoneNumber?.nationalNumber}` : null,
            companyName: this.person.companyName
        });

        Object.values(personDetail).forEach((value) =>
        {
            if (value)
            {
                bulletPoints.push(value);
            }
        });

        return bulletPoints;
    }

    async created(): Promise<void>
    {
        this.setDefaultColumns();
        await this.loadIdentifierRequestPerson();
        await this.loadIdentifiersRequests();
    }

    @Watch('$route.query')
    loadIdentifiersRequests(): Promise<void>
    {
        const filter = new IdentifierFilter({
            page: this.$route.query.page as unknown as number,
            pageSize: this.$route.query.pageSize as unknown as number ?? paginationOptions.defaultPageSize,
            orderBy: this.$route.query.sort as string,
            personId: this.personId
        });

        return this._identifierRequestStore.getIdentifierRequestCandidateListAction(filter);
    }

    @Watch('$route.query')
    loadIdentifierRequestPerson(): Promise<void>
    {
        return this._identifierRequestStore.getIdentifierRequestPersonAction(this.personId);
    }

    @Watch('currentLocale')
    setDefaultColumns(): void
    {
        this.defaultColumns = [];

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('credentialVariantName'),
            title: AppHost.i18n.global.t('IdentifierNameColumnLabel').toString(),
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('identifierNumber'),
            title: AppHost.i18n.global.t('IdentifierNumberColumnLabel').toString(),
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('identifierRequestSubmittedOnUtc'),
            title: AppHost.i18n.global.t('SubmittedOnUtc').toString(),
            cell: 'date-submitted',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('validFrom'),
            title: this.$t('ValidFrom').toString(),
            cell: 'date',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('validTill'),
            title: this.$t('ValidUntil').toString(),
            cell: 'date',
            headerClassName: getSortClass(),
            sortable: true
        });

        this.defaultColumns.push({
            field: nameof<IdentifierRequestCandidateListResource>('identifierRequestWorkflowState'),
            title: AppHost.i18n.global.t('IdentifierStateColumnLabel').toString(),
            headerClassName: getSortClass(),
            cell: 'state',
            sortable: true,
            width: 280
        });

        this.columns = cloneDeep(this.defaultColumns);
    }

    async onViewDetails(identifierRequestId: number): Promise<void>
    {
        this.showIdentifierRequestId = identifierRequestId;
        this.showDetailModal = true;
    }

    closeDetailModal(): void
    {
        this.showDetailModal = false;
        this.showIdentifierRequestId = null;
    }

    isLicensePlate(props): boolean
    {
        return props.dataItem.technology === CredentialTechnologyType.LicensePlate;
    }
}
