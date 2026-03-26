import { Component, mixins, Prop } from 'vue-facing-decorator';
import YimSidebarSteps from 'yim-common/src/components/yim-sidebar-steps/yim-sidebar-steps.vue';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import {
    UpdateAuthorizationRequest,
    AccessSystemAuthorization,
    AccessSystemAccessAuthorization,
    AccessSystemAccessGroupAuthorization,
    AccessSystemTemplateAuthorization,
    AccessSystemAuthorizationType,
    AuthorizationDetailResource,
    AccessSystemAccessListResource,
    AccessSystemTemplateListResource,
    AccessSystemAccessGroupListResource,
    AccessSystemDateTimeScheduleListResource,
    AuthorizationAccreditationType,
    AccreditorGroupType,
    AuthorizationAccreditationPersonRoleType,
    LocationReferenceResource,
    ZoneResource,
    YimAssetWithZoneAndLocationListResource,
    AccessControlSystem,
    DateTimeScheduleResource
} from '@src/models/generated/registration';
import AuthorizationMixin from '@src/utils/mixins/authorization-mixin';
import { HttpStatusCode } from 'yim-common/src/utils/helpers/http-utils';
import { registrationApiService } from '@src/services';
import ProcessMixin from '@src/utils/mixins/process-mixin';
import { AuthorizationTypes, ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import { AuthorizationAccessSystemMapOption, AuthorizationAccessControlMapOptionType } from '@src/models/models';
import AeosPicker from '@src/views/authorization/_partials/aeos-picker.vue';
import SaltoPicker from '@src/views/authorization/_partials/salto-picker.vue';
import IloqPicker from '@src/views/authorization/_partials/iloq-picker.vue';
import { FeatureFlag, FeatureFlags } from '@src/utils/feature-flags';
import { defineRule, Form } from 'vee-validate';
import { AppHost } from 'yim-common/src/abstractions/app-host';
import { ValueModalItem } from 'yim-common/src/models/models';
import { PageRequest } from '@src/models/generated/common';

export class UpdateAuthorizationViewModel
{
    constructor(init?: Partial<UpdateAuthorizationViewModel>)
    {
        Object.assign(this, init);
    }

    name!: string;
    dateTimeScheduleId: string | null = null;
    locationIds!: string[];
    processDefinitionTypes : ProcessDefinitionTypes[] = [];
    authorizationTypes : AuthorizationTypes[] = [];
    contractorTypes: number[] = [];
    zones: ZoneResource[] = [];

    aeosTemplateId: number | null = null;
    aeosAccessId: number | null = null;
    aeosDateTimeScheduleId: number | null = null;
    aeosAccessGroupId: number | null = null;
    aeosMapOption: AuthorizationAccessControlMapOptionType = AuthorizationAccessControlMapOptionType.None;

    iloqAccessGroupId: number | null = null;
    iloqMapOption: AuthorizationAccessControlMapOptionType = AuthorizationAccessControlMapOptionType.None;

    saltoTemplateId: number | null = null;
    saltoAccessId: number | null = null;
    saltoDateTimeScheduleId: number | null = null;
    saltoAccessGroupId: number | null = null;
    saltoMapOption: AuthorizationAccessControlMapOptionType = AuthorizationAccessControlMapOptionType.None;

    disableAccreditation: boolean;
    description: string | null;
    employeeAccreditationType: AuthorizationAccreditationType | null = 0;
    firstStepAccreditorType: AccreditorGroupType | null = null;
    secondStepAccreditorType: AccreditorGroupType | null = null;

    sendNotification: boolean;
    yimAssets: YimAssetWithZoneAndLocationListResource[] = [];

    static fromResponse(source: AuthorizationDetailResource): UpdateAuthorizationViewModel
    {
        const target = new UpdateAuthorizationViewModel();

        target.dateTimeScheduleId = source.dateTimeSchedule.dateTimeScheduleId;
        target.locationIds = source.locations.map((location: LocationReferenceResource) => location.locationId);
        target.name = source.name;
        target.processDefinitionTypes = source.processDefinitionTypes;
        target.authorizationTypes = source.authorizationTypes;
        target.zones = source.zones;
        target.aeosMapOption = AuthorizationAccessControlMapOptionType.None;
        target.disableAccreditation = source.disableAccreditation;
        target.description = source.description;
        target.contractorTypes = source.contractorTypes.map((type) => type.id);
        target.sendNotification = source.sendNotification;
        target.yimAssets = source.yimAssets;

        target.employeeAccreditationType = source?.employeeAuthorizationAccreditationType?.accreditationType ?? 0;
        target.firstStepAccreditorType = source?.employeeAuthorizationAccreditationType?.firstStepAccreditorType;
        target.secondStepAccreditorType = source?.employeeAuthorizationAccreditationType?.secondStepAccreditorType;

        if (source.aeosMapping !== null)
        {
            switch (source.aeosMapping.mappingType)
            {
                case AccessSystemAuthorizationType.Template:
                    target.aeosTemplateId = source.aeosMapping.template?.templateId ?? null;
                    target.aeosMapOption = AuthorizationAccessControlMapOptionType.Template;
                    break;

                case AccessSystemAuthorizationType.Access:
                    target.aeosAccessId = source.aeosMapping.access?.accessId ?? null;
                    target.aeosDateTimeScheduleId = source.aeosMapping.access?.dateTimeScheduleId ?? null;
                    target.aeosMapOption = AuthorizationAccessControlMapOptionType.Access;
                    break;

                case AccessSystemAuthorizationType.AccessGroup:
                    target.aeosAccessGroupId = source.aeosMapping.accessGroup?.accessGroupId ?? null;
                    target.aeosDateTimeScheduleId = source.aeosMapping.accessGroup?.dateTimeScheduleId ?? null;
                    target.aeosMapOption = AuthorizationAccessControlMapOptionType.AccessGroup;
                    break;
            }
        }

        if (source.iloqMapping !== null)
        {
            switch (source.iloqMapping.mappingType)
            {
                case AccessSystemAuthorizationType.AccessGroup:
                    target.iloqAccessGroupId = source.iloqMapping.accessGroup?.accessGroupId ?? null;
                    target.iloqMapOption = AuthorizationAccessControlMapOptionType.AccessGroup;
                    break;
            }
        }

        if (source.saltoMapping !== null)
        {
            switch (source.saltoMapping.mappingType)
            {
                case AccessSystemAuthorizationType.Template:
                    target.saltoTemplateId = source.saltoMapping.template?.templateId ?? null;
                    target.saltoMapOption = AuthorizationAccessControlMapOptionType.Template;
                    break;

                case AccessSystemAuthorizationType.Access:
                    target.saltoAccessId = source.saltoMapping.access?.accessId ?? null;
                    target.saltoDateTimeScheduleId = source.saltoMapping.access?.dateTimeScheduleId ?? null;
                    target.saltoMapOption = AuthorizationAccessControlMapOptionType.Access;
                    break;

                case AccessSystemAuthorizationType.AccessGroup:
                    target.saltoAccessGroupId = source.saltoMapping.accessGroup?.accessGroupId ?? null;
                    target.saltoDateTimeScheduleId = source.saltoMapping.accessGroup?.dateTimeScheduleId ?? null;
                    target.saltoMapOption = AuthorizationAccessControlMapOptionType.AccessGroup;
                    break;
            }
        }

        return target;
    }

    toRequest(aeosMapOption: AuthorizationAccessControlMapOptionType,
        iloqMapOptions: AuthorizationAccessControlMapOptionType,
        saltoMapOptions: AuthorizationAccessControlMapOptionType): UpdateAuthorizationRequest
    {
        const request = new UpdateAuthorizationRequest({
            dateTimeScheduleId: this.dateTimeScheduleId,
            locationIds: this.locationIds,
            name: this.name,
            processDefinitionTypes: this.processDefinitionTypes,
            authorizationTypes: this.authorizationTypes,
            contractorTypeIds: this.contractorTypes,
            zones: this.zones.map((zone) => zone.zoneId),
            disableAccreditation: this.disableAccreditation,
            description: this.description,
            employeeAuthorizationAccreditationType: new AuthorizationAccreditationPersonRoleType({
                accreditationType: this.employeeAccreditationType,
                firstStepAccreditorType: this.firstStepAccreditorType,
                secondStepAccreditorType: this.secondStepAccreditorType
            }),
            sendNotification: this.sendNotification,
            yimAssets: this.yimAssets
        });

        if (request.employeeAuthorizationAccreditationType.accreditationType !== AuthorizationAccreditationType.TwoStep)
        {
            request.employeeAuthorizationAccreditationType.firstStepAccreditorType = null;
            request.employeeAuthorizationAccreditationType.secondStepAccreditorType = null;
        }

        switch (aeosMapOption)
        {
            case AuthorizationAccessControlMapOptionType.Template:
                request.aeosMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.Template,
                    template: new AccessSystemTemplateAuthorization({
                        templateId: this.aeosTemplateId ?? 0
                    })
                });
                break;
            case AuthorizationAccessControlMapOptionType.Access:
                request.aeosMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.Access,
                    access: new AccessSystemAccessAuthorization({
                        accessId: this.aeosAccessId ?? 0,
                        dateTimeScheduleId: this.aeosDateTimeScheduleId ?? 0
                    })
                });
                break;
            case AuthorizationAccessControlMapOptionType.AccessGroup:
                request.aeosMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.AccessGroup,
                    accessGroup: new AccessSystemAccessGroupAuthorization({
                        accessGroupId: this.aeosAccessGroupId ?? 0,
                        dateTimeScheduleId: this.aeosDateTimeScheduleId ?? 0
                    })
                });
                break;
        }

        switch (iloqMapOptions)
        {
            case AuthorizationAccessControlMapOptionType.AccessGroup:
                request.iloqMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.AccessGroup,
                    accessGroup: new AccessSystemAccessGroupAuthorization({
                        accessGroupId: this.iloqAccessGroupId ?? 0,
                        dateTimeScheduleId: 0
                    })
                });
                break;
        }

        switch (saltoMapOptions)
        {
            case AuthorizationAccessControlMapOptionType.Template:
                request.saltoMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.Template,
                    template: new AccessSystemTemplateAuthorization({
                        templateId: this.saltoTemplateId ?? 0
                    })
                });
                break;
            case AuthorizationAccessControlMapOptionType.Access:
                request.saltoMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.Access,
                    access: new AccessSystemAccessAuthorization({
                        accessId: this.saltoAccessId ?? 0,
                        dateTimeScheduleId: this.saltoDateTimeScheduleId ?? 0
                    })
                });
                break;
            case AuthorizationAccessControlMapOptionType.AccessGroup:
                request.saltoMapping = new AccessSystemAuthorization({
                    mappingType: AccessSystemAuthorizationType.AccessGroup,
                    accessGroup: new AccessSystemAccessGroupAuthorization({
                        accessGroupId: this.saltoAccessGroupId ?? 0,
                        dateTimeScheduleId: this.saltoDateTimeScheduleId ?? 0
                    })
                });
                break;
        }

        return request;
    }
}

@Component({
    components: {
        'yim-sidebar-steps': YimSidebarSteps,
        'aeos-picker': AeosPicker,
        'iloq-picker': IloqPicker,
        'salto-picker': SaltoPicker,
        Form
    }
})
export default class UpdateAuthorization extends mixins(BaseMixin, FilterMixin, AuthorizationMixin, ProcessMixin)
{
    @Prop()
    label: string | null;

    form: UpdateAuthorizationViewModel = new UpdateAuthorizationViewModel();

    authorizationFound: boolean | null = null;

    selectedAeosTemplate: AccessSystemTemplateListResource | null = null;
    selectedAeosAccess: AccessSystemAccessListResource | null = null;
    selectedAeosAccessGroup: AccessSystemAccessGroupListResource | null = null;
    selectedAeosDayTimeSchedule: AccessSystemDateTimeScheduleListResource | null = null;

    selectedIloqAccessGroup: AccessSystemAccessGroupListResource | null = null;

    selectedSaltoTemplate: AccessSystemTemplateListResource | null = null;
    selectedSaltoAccess: AccessSystemAccessListResource | null = null;
    selectedSaltoAccessGroup: AccessSystemAccessGroupListResource | null = null;
    selectedSaltoDayTimeSchedule: AccessSystemDateTimeScheduleListResource | null = null;

    yimAssets: ValueModalItem<YimAssetWithZoneAndLocationListResource>[] = [];
    selectedYimAssets: ValueModalItem<YimAssetWithZoneAndLocationListResource>[] = [];

    requiresAeosTemplate = false;
    requiresSaltoTemplate = false;

    authorizationAccreditationTypeOptions: { name: string; value: AuthorizationAccreditationType }[] = [
        {
            name: AppHost.i18n.global.t('Disabled'),
            value: AuthorizationAccreditationType.Disabled
        },
        {
            name: AppHost.i18n.global.t('AuthorizationAccreditationTypeOneStep'),
            value: AuthorizationAccreditationType.OneStep
        },
        {
            name: AppHost.i18n.global.t('AuthorizationAccreditationTypeTwoStep'),
            value: AuthorizationAccreditationType.TwoStep
        }
    ];

    accreditorGroupTypeOptions: { name: string; value: AccreditorGroupType }[] = [
        {
            name: AppHost.i18n.global.t('AccreditorGroupTypeManager'),
            value: AccreditorGroupType.Manager
        },
        {
            name: AppHost.i18n.global.t('AccreditorGroupTypeFloorManager'),
            value: AccreditorGroupType.FloorManager
        }
    ];

    get hasTenantTwoStepAccreditationEnabled(): boolean
    {
        return FeatureFlags.hasFeature(FeatureFlag.EnableAccessRuleTwoStepAccreditation);
    }

    get enableEmployeeProcessAccreditorDropdowns(): boolean
    {
        return this.hasTenantTwoStepAccreditationEnabled && this.form.employeeAccreditationType === AuthorizationAccreditationType.TwoStep;
    }

    get authorizationTypeIsParkingLot(): boolean
    {
        return this.form.authorizationTypes.includes(AuthorizationTypes.ParkingLot);
    }

    get isAccreditationDisabled(): boolean
    {
        return this.form.disableAccreditation ||
            this.form.employeeAccreditationType === AuthorizationAccreditationType.Disabled;
    }

    get yimAssetRequiresAccreditation(): boolean
    {
        return this.form.yimAssets.some((asset) => asset.requiresAccreditation);
    }

    get yimAssetRequiringAccreditation(): YimAssetWithZoneAndLocationListResource | undefined
    {
        return this.form.yimAssets.find((asset) => asset.requiresAccreditation);
    }

    disableAccreditationRule(value: boolean): boolean | string
    {
        if (value === true && this.yimAssetRequiresAccreditation)
        {
            return this.$t('YimAssetRequiresAccreditation', [this.yimAssetRequiringAccreditation.name]);
        }

        return true;
    }

    employeeAccreditationTypeRule(): boolean | string
    {
        if (this.hasTenantTwoStepAccreditationEnabled && this.form.employeeAccreditationType === AuthorizationAccreditationType.Disabled && this.yimAssetRequiresAccreditation)
        {
            return this.$t('YimAssetRequiresAccreditation', [this.yimAssetRequiringAccreditation.name]);
        }

        return true;
    }

    get authorizationId(): string
    {
        return this.$route.params.authorizationId as string;
    }

    get selectedDateTimeSchedule(): DateTimeScheduleResource | null
    {
        return this.dateTimeSchedules.find((dateTimeSchedule) => dateTimeSchedule.dateTimeScheduleId === this.form.dateTimeScheduleId);
    }

    get requiresSaltoSchedule(): boolean
    {
        return this.form.yimAssets.some((yimAsset) => yimAsset.requiresSchedule && yimAsset.accessSystemType === AccessControlSystem.Salto);
    }

    get requiresAeosSchedule(): boolean
    {
        return this.form.yimAssets.some((yimAsset) => yimAsset.requiresSchedule && yimAsset.accessSystemType === AccessControlSystem.Aeos);
    }

    get filteredDateTimeSchedules(): DateTimeScheduleResource[]
    {
        return this.tagStore.dateTimeSchedules.filter((dateTimeSchedule) => (!this.requiresAeosSchedule || dateTimeSchedule.aeosScheduleId) && (!this.requiresSaltoSchedule || dateTimeSchedule.saltoScheduleId));
    }

    async created(): Promise<void>
    {
        defineRule('disableAccreditationRule', this.disableAccreditationRule );
        defineRule('employeeAccreditationTypeRule', this.employeeAccreditationTypeRule );

        await this.getInitialData();

        const httpResponse = await registrationApiService.getAuthorization(this.$route.params.authorizationId as string);

        if (httpResponse.isSuccess)
        {
            const response = httpResponse.data;
            this.form = UpdateAuthorizationViewModel.fromResponse(response);
            this.setSelectedAeosMapOption(this.form.aeosMapOption);
            this.setSelectedIloqMapOption(this.form.iloqMapOption);
            this.setSelectedSaltoMapOption(this.form.saltoMapOption);

            this.selectedAeosTemplate = this.aeosTemplates.find((template) => template.id === this.form.aeosTemplateId) ?? null;
            this.selectedAeosAccess = this.aeosAccesses.find((access) => access.id === this.form.aeosAccessId) ?? null;
            this.selectedAeosAccessGroup = this.aeosAccessGroups.find((accessGroup) => accessGroup.id === this.form.aeosAccessGroupId) ?? null;
            this.selectedAeosDayTimeSchedule = this.aeosDatetimeSchedules.find((dayTimeSchedule) => dayTimeSchedule.id === this.form.aeosDateTimeScheduleId) ?? null;

            this.selectedIloqAccessGroup = this.iloqAccessGroups.find((accessGroup) => accessGroup.id === this.form.iloqAccessGroupId) ?? null;

            this.selectedSaltoTemplate = this.saltoTemplates.find((template) => template.id === this.form.saltoTemplateId) ?? null;
            this.selectedSaltoAccess = this.saltoAccesses.find((access) => access.id === this.form.saltoAccessId) ?? null;
            this.selectedSaltoAccessGroup = this.saltoAccessGroups.find((accessGroup) => accessGroup.id === this.form.saltoAccessGroupId) ?? null;
            this.selectedSaltoDayTimeSchedule = this.saltoDatetimeSchedules.find((dayTimeSchedule) => dayTimeSchedule.id === this.form.saltoDateTimeScheduleId) ?? null;

            this.selectedYimAssets = response.yimAssets?.map((asset) => new ValueModalItem<YimAssetWithZoneAndLocationListResource>({
                id: asset.yimAssetId.toString(),
                name: asset.name,
                subtitle: this.formatSubtitle(asset.location.name, asset.zone.name),
                value: asset
            }));

            this.authorizationFound = true;
        }

        if (httpResponse.statusCode === HttpStatusCode.NotFound)
        {
            this.authorizationFound = false;
        }
    }

    async updateAuthorization(): Promise<void>
    {
        this.disableActionButton();
        const validationResult = await this.validate();
        if (!validationResult.valid)
        {
            this.enableActionButton();
            return;
        }

        const aeosOption = this.selectedAeosMapOption as AuthorizationAccessSystemMapOption;
        const iloqOption = this.selectedIloqMapOption as AuthorizationAccessSystemMapOption;
        const saltoOption = this.selectedSaltoMapOption as AuthorizationAccessSystemMapOption;
        const request = this.form.toRequest(aeosOption.value, iloqOption.value, saltoOption.value);
        const response = await registrationApiService.updateAuthorization(this.authorizationId, request);
        if (response.isSuccess)
        {
            this.showServiceSuccess('Access rule has been updated');
            await this.$router.push('/management/authorization/overview');
        }
        else
        {
            this.showServiceError(response);
            this.enableActionButton();
        }
    }

    aeosDateTimeScheduleChanged(dateTimeScheduleId: string) : void
    {
        this.form.aeosDateTimeScheduleId = dateTimeScheduleId ? Number.parseInt(dateTimeScheduleId) : null;
    }

    aeosTemplateChanged(templateId: string | null): void
    {
        this.form.aeosTemplateId = templateId ? Number.parseInt(templateId) : null;
    }

    aeosAccessChanged(accessd: string | null): void
    {
        this.form.aeosAccessId = accessd ? Number.parseInt(accessd) : null;
    }

    aeosAccessGroupChanged(accessGroupId: string | null): void
    {
        this.form.aeosAccessGroupId = accessGroupId ? Number.parseInt(accessGroupId) : null;
    }

    iloqAccessGroupChanged(accessGroupId: string | null): void
    {
        this.form.iloqAccessGroupId = accessGroupId ? Number.parseInt(accessGroupId) : null;
    }

    saltoAccessGroupChanged(accessGroupId: string | null): void
    {
        this.form.saltoAccessGroupId = accessGroupId ? Number.parseInt(accessGroupId) : null;
    }

    saltoDateTimeScheduleChanged(dateTimeScheduleId: string): void
    {
        this.form.saltoDateTimeScheduleId = dateTimeScheduleId ? Number.parseInt(dateTimeScheduleId) : null;
    }

    saltoTemplateChanged(templateId: string | null): void
    {
        this.form.saltoTemplateId = templateId ? Number.parseInt(templateId) : null;
    }

    saltoAccessChanged(accessId: string | null): void
    {
        this.form.saltoAccessId = accessId ? Number.parseInt(accessId) : null;
    }

    async onYimAssetsWithZoneAndLocationSearch(filter: PageRequest): Promise<void>
    {
        const response = await registrationApiService.findYimAssetsWithZoneAndLocation(filter);

        if (response.isSuccess)
        {
            this.yimAssets = response.data.items.map((asset) => new ValueModalItem<YimAssetWithZoneAndLocationListResource>({
                id: asset.yimAssetId.toString(),
                name: asset.name,
                subtitle: this.formatSubtitle(asset.location.name, asset.zone.name),
                value: asset
            }));
        }
        else
        {
            this.showServiceError(response);
        }
    }

    onYimAssetsWithZoneAndLocationSelectItems(selectedItems: ValueModalItem<YimAssetWithZoneAndLocationListResource>[]): void
    {
        if (!this.selectedDateTimeSchedule)
        {
            return;
        }

        this.selectedYimAssets = selectedItems;
        this.form.yimAssets = selectedItems.map((item) => item.value);

        if ((this.requiresAeosSchedule && !this.selectedDateTimeSchedule.aeosScheduleId) ||
            (this.requiresSaltoSchedule && !this.selectedDateTimeSchedule.saltoScheduleId))
        {
            this.showWarning(this.$t('SelectedDateTimeScheduleNotAllowedToBeSelected'));
            this.form.dateTimeScheduleId = null;
        }
    }

    formatSubtitle(locationName: string, zoneName: string): string
    {
        return `${this.$t('Zone')}: ${zoneName} \u2022 ${this.$t('Location')}: ${locationName}`;
    }
}
