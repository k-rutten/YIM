import { Component, mixins, Prop } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { DialogActionsBar } from '@progress/kendo-vue-dialogs';
import { registrationApiService } from '@src/services';
import {
    AddElearningInviteByPersonAuthorizationRequest,
    ElearningInviteResource
} from '@src/models/generated/registration';
import { formatYimDate } from 'yim-common/src/utils/filters/dates/format';
import { useToastsStore } from 'yim-common/src/store/toasts-module';
import { GenerateCodeType, ToastTypes } from 'yim-common/src/models/models';
import { AppHost } from 'yim-common/src/abstractions/app-host';

@Component({
    components: {
        'dialog-actions-bar': DialogActionsBar
    },
    emits: ['close']
})

export default class ElearningCodeGenerator extends mixins(BaseMixin)
{
    @Prop()
    authorizationId!: string;

    selectedGenerateOption = GenerateCodeType.ActivateOnLocation;

    onSiteElearningInvitations: ElearningInviteResource[] = [];

    generateOptions: { id: number, name: string }[] = [
        {
            id: GenerateCodeType.ActivateOnLocation,
            name: AppHost.i18n.global.t('ActivateOnLocation') as string
        },
        {
            id: GenerateCodeType.SendEmail,
            name: AppHost.i18n.global.t('SendEmail').toString()
        }
    ];

    get description(): string
    {
        return this.onSiteElearningInvitations.length > 0 ? AppHost.i18n.global.t('CodeGenerateShareText').toString() : AppHost.i18n.global.t('CodeGenerateIntroText').toString();
    }

    async generateOnSiteElearningInvitations(): Promise<void>
    {
        const response = await registrationApiService.addElearningInviteByPersonAuthorization(this.authorizationId, new AddElearningInviteByPersonAuthorizationRequest({
            excludeEmailConfirmation: true,
            returnInviteDetails: true
        }));
        if (response.isSuccess)
        {
            this.onSiteElearningInvitations = response.data.map((item) => new ElearningInviteResource({
                elearningName: item.elearningName,
                invitationSentOnUtc: item.invitationSentOnUtc,
                details: item.details ?? {}
            }));
        }
        else
        {
            this.onSiteElearningInvitations = [];
            this.showServiceError(response);
        }
    }

    async generateElearningInvitations(): Promise<void>
    {
        const response = await registrationApiService
            .addElearningInviteByPersonAuthorization(this.authorizationId, new AddElearningInviteByPersonAuthorizationRequest());
        if (response.isSuccess)
        {
            response.data.forEach((item) =>
            {
                if (item.invitationSentOnUtc !== null)
                {
                    useToastsStore().showToastAction({ text: AppHost.i18n.global.t(`Invitation {name} has already been sent on {value}`,
                        {
                            name: item.elearningName,
                            value: formatYimDate(item.invitationSentOnUtc)
                        }).toString(), type: ToastTypes.warning
                    });
                }
                else
                {
                    this.showServiceSuccess('InvitationSent');
                }
            });

            this.$emit('close');
        }
        else
        {
            this.showServiceError(response);
        }
    }

    close(): void
    {
        this.onSiteElearningInvitations = [];
        this.$emit('close');
    }

    save(): void
    {
        switch (this.selectedGenerateOption)
        {
            case GenerateCodeType.ActivateOnLocation:
                this.generateOnSiteElearningInvitations();
                break;
            default:
                this.generateElearningInvitations();
                break;
        }
    }
}
