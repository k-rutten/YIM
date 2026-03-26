import { Component, mixins, Prop, Watch } from 'vue-facing-decorator';
import YimSidebarSteps from 'yim-common/src/components/yim-sidebar-steps/yim-sidebar-steps.vue';
import BaseMixin from '@src/utils/mixins/base-mixin';
import FilterMixin from 'yim-common/src/utils/mixins/filter-mixin';
import
{
    AccreditorGroupType,
    AddAuthorizationRequest,
    AccessSystemAuthorization,
    AccessSystemAccessAuthorization,
    AccessSystemAccessGroupAuthorization,
    AccessSystemTemplateAuthorization,
    AccessSystemAuthorizationType,
    AuthorizationAccreditationPersonRoleType,
    AuthorizationAccreditationType,
    ZoneResource,
    DateTimeScheduleResource,
    AccessControlSystem,
    YimAssetWithZoneAndLocationListResource,
    DateTimeScheduleFilter
} from '@src/models/generated/registration';
import { AuthorizationAccessControlMapOptionType, AuthorizationAccessSystemMapOption } from '@src/models/models';
import AuthorizationMixin from '@src/utils/mixins/authorization-mixin';
import { registrationApiService } from '@src/services';
import ProcessMixin from '@src/utils/mixins/process-mixin';
import { AuthorizationTypes, ProcessDefinitionTypes } from '@src/models/generated/process-definitions';
import AeosPicker from '@src/views/authorization/_partials/aeos-picker.vue';
import SaltoPicker from '@src/views/authorization/_partials/salto-picker.vue';
import IloqPicker from '@src/views/authorization/_partials/iloq-picker.vue';
import { FeatureFlag, FeatureFlags } from '@src/utils/feature-flags';
import { defineRule, Form } from 'vee-validate';
import { AppHost } from 'yim-common/src/abstractions/app-host';
import { ValueModalItem } from 'yim-common/src/models/models';
import { PageRequest } from '@src/models/generated/common';

class AddAuthorizationViewModel
{
    constructor(init?: Partial<AddAuthorizationViewModel>)
    {
        Object.assign(this, init);
    }

    name!: string;
    dateTimeScheduleId!: string;
    locationIds!: string[];
    processDefinitionTypes : ProcessDefinitionTypes[] = [];
    authorizationTypes : AuthorizationTypes[] = [];
    contractorTypes: number[] = [];
    zones: ZoneResource[] = [];

    aeosTemplateId: number | null = null;
    aeosAccessId: number | null = null;
    aeosDateTimeScheduleId: number | null = null;
    aeosAccessGroupId: number | null = null;

    iloqAccessGroupId: number | null = null;

    saltoTemplateId: number | null = null;
    saltoAccessId: number | null = null;
    saltoDateTimeScheduleId: number | null = null;
    saltoAccessGroupId: number | null = null;

    disableAccreditation : boolean;
    description: string;
    employeeAccreditationType: AuthorizationAccreditationType | null = 0;
    firstStepAccreditorType: AccreditorGroupType | null = null;
    secondStepAccreditorType: AccreditorGroupType | null = null;

    sendNotification: boolean = false;
    yimAssets: YimAssetWithZoneAndLocationListResource[] = [];

    toRequest(aeosMapOption: AuthorizationAccessControlMapOptionType,
        iloqMapOptions: AuthorizationAccessControlMapOptionType,
        saltoMapOptions: AuthorizationAccessControlMapOptionType): AddAuthorizationRequest
    {
        const request = new AddAuthorizationRequest({
            dateTimeScheduleId: this.dateTimeScheduleId,
            locationIds: this.locationIds,
            name: this.name,
            disableAccreditation: this.disableAccreditation,
            processDefinitionTypes: this.processDefinitionTypes,
            authorizationTypes: this.authorizationTypes,
            contractorTypeIds: this.contractorTypes,
            zones: this.zones.map((zone) => zone.zoneId),
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
export default class AddAuthorization extends mixins(BaseMixin, FilterMixin, AuthorizationMixin, ProcessMixin)
{
    @Prop()
    label: string | null;

    form: AddAuthorizationViewModel = new AddAuthorizationViewModel();

    yimAssets: ValueModalItem<YimAssetWithZoneAndLocationListResource>[] = [];
    selectedYimAssets: ValueModalItem<YimAssetWithZoneAndLocationListResource>[] = [];

    requiresAeosTemplate = false;
    requiresSaltoTemplate = false;

    private _isLocaleChanging = false;

    get authorizationAccreditationTypeOptions(): { name: string; value: AuthorizationAccreditationType }[]
    {
        return [
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
    }

    get accreditorGroupTypeOptions(): { name: string; value: AccreditorGroupType }[]
    {
        return [
            {
                name: AppHost.i18n.global.t('AccreditorGroupTypeManager'),
                value: AccreditorGroupType.Manager
            },
            {
                name: AppHost.i18n.global.t('AccreditorGroupTypeFloorManager'),
                value: AccreditorGroupType.FloorManager
            }
        ];
    }

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

    get requiredAccessSystemTypes(): AccessControlSystem[]
    {
        const accessSystemTypes = [];

        if (this.requiresSaltoSchedule)
        {
            accessSystemTypes.push(AccessControlSystem.Salto);
        }
        if (this.requiresAeosSchedule)
        {
            accessSystemTypes.push(AccessControlSystem.Aeos);
        }

        return accessSystemTypes;
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

    returnAuthorizationTypeisParkingLot(): boolean
    {
        return this.authorizationTypeIsParkingLot;
    }

    async created(): Promise<void>
    {
        defineRule('disableAccreditationRule', this.disableAccreditationRule );
        defineRule('employeeAccreditationTypeRule', this.employeeAccreditationTypeRule );
        await this.getInitialData();
    }

    @Watch('currentLocale')
    onLocaleChanged(newLocale: string, oldLocale: string): void
    {
        if (oldLocale && newLocale !== oldLocale)
        {
            this._handleLocaleChange();
        }
    }

    private _handleLocaleChange(): void
    {
        // Set flag to prevent validation during locale change
        this._isLocaleChanging = true;

        // Store current form data
        const currentFormData = { ...this.form };

        // Reset validation errors without triggering validation
        this.resetValidationErrors();

        // Use nextTick to ensure DOM updates are complete before restoring data
        this.$nextTick(() =>
        {
            // Restore form data
            Object.assign(this.form, currentFormData);

            // Reset the locale changing flag
            this._isLocaleChanging = false;
        });
    }

    aeosDateTimeScheduleChanged(dateTimeScheduleId: string) : void
    {
        this.form.aeosDateTimeScheduleId = dateTimeScheduleId ? Number.parseInt(dateTimeScheduleId) : null;
    }

    aeosTemplateChanged(templateId: string | null): void
    {
        this.form.aeosTemplateId = templateId ? Number.parseInt(templateId) : null;
    }

    aeosAccessChanged(accessId: string | null): void
    {
        this.form.aeosAccessId = accessId ? Number.parseInt(accessId) : null;
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

    async addAuthorization(): Promise<void>
    {
        // Don't proceed if locale is currently changing
        if (this._isLocaleChanging)
        {
            return;
        }

        this.disableActionButton();

        const validationResult = await this.validate();
        if (!validationResult.valid || !this.setSelectedAeosMapOption)
        {
            this.enableActionButton();
            return;
        }

        if (this.hasTenantTwoStepAccreditationEnabled && this.isAccreditationDisabled && this.yimAssetRequiringAccreditation)
        {
            const errorMessage = this.$t('YimAssetRequiresAccreditation', [this.yimAssetRequiringAccreditation.name]);
            this.showError(errorMessage);

            const errors: Record<string, string[]> = {};
            if (this.form.disableAccreditation)
            {
                errors.disableAccreditation = [errorMessage];
            }
            if (this.form.employeeAccreditationType === AuthorizationAccreditationType.Disabled)
            {
                errors.employeeAccreditationType = [errorMessage];
            }
            this.getValidationObserver()?.setErrors(errors);

            this.enableActionButton();
            return;
        }

        const aeosOption = this.selectedAeosMapOption as AuthorizationAccessSystemMapOption;
        const iloqOption = this.selectedIloqMapOption as AuthorizationAccessSystemMapOption;
        const saltoOption = this.selectedSaltoMapOption as AuthorizationAccessSystemMapOption;
        const request = this.form.toRequest(aeosOption.value, iloqOption.value, saltoOption.value);
        const response = await registrationApiService.addAuthorization(request);
        if (response.isSuccess)
        {
            this.showServiceSuccess('Access rule has been created');

            await this.$router.push('/management/authorization/overview');
        }
        else
        {
            this.showServiceError(response);
        }

        this.enableActionButton();
    }

    onYimAssetsWithZoneAndLocationSelectItems(selectedItems: ValueModalItem<YimAssetWithZoneAndLocationListResource>[]): void
    {
        this.selectedYimAssets = selectedItems;
        this.form.yimAssets = selectedItems.map((item) => item.value);

        if (this.selectedDateTimeSchedule && ((this.requiresAeosSchedule && !this.selectedDateTimeSchedule.aeosScheduleId) ||
            (this.requiresSaltoSchedule && !this.selectedDateTimeSchedule.saltoScheduleId)))
        {
            this.showWarning(this.$t('SelectedDateTimeScheduleNotAllowedToBeSelected'));
            this.form.dateTimeScheduleId = null;
        }

        this.tagStore.loadDateTimeSchedulesAction(new DateTimeScheduleFilter({ pageSize: 100, accessControlSystems: this.requiredAccessSystemTypes }));
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

    formatSubtitle(locationName: string, zoneName: string): string
    {
        return `${this.$t('Zone')}: ${zoneName} \u2022 ${this.$t('Location')}: ${locationName}`;
    }
}
