import { Component, mixins, Prop } from 'vue-facing-decorator';
import { CredentialProductionType, CredentialTechnologyType, CredentialRequestWorkflowState } from '@src/models/generated/registration';
import { YimUrls } from '@src/utils/helpers/url';
import paramNames from '@src/utils/types/param-names';
import EnumLocalizerMixin from '@src/utils/mixins/enum-localizer-mixin';
import { registrationApiService } from '@src/services';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { directive } from 'vue3-click-away';

interface IMenuPosition { top: number; left: number }

@Component({
    emits: ['refresh', 'cancel-link-unlink', 'view-details'],
    directives: {
        clickAway: directive
    }
})
export default class IdentifierActions extends mixins(BaseMixin, EnumLocalizerMixin)
{
    @Prop()
    workFlowState: CredentialRequestWorkflowState;

    @Prop()
    productionType: CredentialProductionType;

    @Prop()
    technologyType: CredentialTechnologyType;

    @Prop()
    type!: number;

    @Prop()
    requestId: number;

    @Prop()
    hasIdentifier: boolean;

    @Prop()
    hasLinkUnlink: boolean | undefined;

    @Prop()
    canCancelLinkUnlink: boolean | undefined;

    @Prop()
    currentUserProfileId: string;

    @Prop()
    requestorId: string;

    @Prop()
    identifierId: number;

    showMenu = false;

    menuPosition: IMenuPosition | null = null;

    private readonly _onViewportChanged = (): void =>
    {
        this.closeMenu();
    };

    private _viewportListenersAttached = false;

    static openMenuInstance: IdentifierActions | null = null;

    identifierRequestWorkflowState = CredentialRequestWorkflowState;
    showConfirmModal = false;
    showCancelLinkUnlinkModal = false;

    get menuStyle(): Record<string, string>
    {
        if (!this.menuPosition)
        {
            return {
                position: 'fixed',
                top: '0px',
                left: '0px',
                opacity: '0',
                pointerEvents: 'none'
            };
        }

        return {
            position: 'fixed',
            top: `${this.menuPosition.top}px`,
            left: `${this.menuPosition.left}px`
        };
    }

    get isReadyForCooldown(): boolean
    {
        return this.workFlowState === CredentialRequestWorkflowState.ReadyForCooldown;
    }

    get currentUserIsRequestor(): boolean
    {
        return this.currentUserProfileId === this.requestorId;
    }

    get isReplaceAction(): boolean
    {
        return this.hasIdentifier && this.canCreateRequestHelper(true) && this.technologyType !== CredentialTechnologyType.Print;
    }

    get isRequestAction(): boolean
    {
        return this.canCreateRequestHelper(false);
    }

    get isLinkUnlinkAction(): boolean
    {
        return this.hasLinkUnlink && this.canCreateRequestHelper(true);
    }

    get isEditAction(): boolean
    {
        switch (this.workFlowState)
        {
            case CredentialRequestWorkflowState.Draft:
                return true;
            case CredentialRequestWorkflowState.ReadyForIdentifierActivation:
                return this.technologyType === CredentialTechnologyType.Print;
            default:
                return false;
        }
    }

    get isCancelAction(): boolean
    {
        return this.workFlowState === CredentialRequestWorkflowState.Draft ||
            this.workFlowState === CredentialRequestWorkflowState.ReadyForCooldown;
    }

    get isRevokeAction(): boolean
    {
        return this.workFlowState === CredentialRequestWorkflowState.ReadyForAccreditation ||
            this.workFlowState === CredentialRequestWorkflowState.ReadyForOrder;
    }

    get personId(): string
    {
        return this.$route.params[paramNames.personId] as string;
    }

    canCreateRequestHelper(includeActivated: boolean): boolean
    {
        return this.workFlowState === null ||
        this.workFlowState === CredentialRequestWorkflowState.RequestCompletedAndAbandoned ||
        this.workFlowState === CredentialRequestWorkflowState.RequestCompletedAndDeactivated ||
        this.workFlowState === CredentialRequestWorkflowState.RequestCompletedAndRejected ||
        this.workFlowState === CredentialRequestWorkflowState.RequestCompletedAndRevoked ||
        this.workFlowState === CredentialRequestWorkflowState.Expired ||
        (includeActivated && this.workFlowState === CredentialRequestWorkflowState.RequestCompletedAndActivated);
    }

    getStateClassModifier(state: CredentialRequestWorkflowState | null): string
    {
        return state === null ? '' : CredentialRequestWorkflowState[state].toLowerCase();
    }

    onShowCancelLinkUnlinkModal($event: Event): void
    {
        $event.stopPropagation();
        this.showCancelLinkUnlinkModal = true;
    }

    async onConfirmCancelLinkUnlink(): Promise<void>
    {
        this.disableActionButton();

        const response = await registrationApiService.cancelIdentifierLinkUnlink(this.requestId);
        if (response.isSuccess)
        {
            this.showServiceSuccess('CanceledIdentifierRequest');
            this.$emit('refresh');
            this.enableActionButton();
        }
        else
        {
            this.showServiceError(response);
            this.enableActionButton();
        }

        this.showCancelLinkUnlinkModal = false;
    }

    async onCancelAction(): Promise<void>
    {
        this.disableActionButton();

        const response = await registrationApiService.deleteIdentifierRequest(this.requestId);
        if (response.isSuccess)
        {
            this.showServiceSuccess('CanceledIdentifierRequest');
            this.$emit('refresh');
            this.enableActionButton();
        }
        else
        {
            this.showServiceError(response);
            this.enableActionButton();
        }

        this.showConfirmModal = false;
    }

    onRequestAction(): void
    {
        if (this.technologyType === CredentialTechnologyType.Print)
        {
            this.$router.push({
                path: YimUrls.requestPrintIdentifierUrl(this.type, this.personId)
            });
        }
        else if (this.technologyType === CredentialTechnologyType.IloqS5Key)
        {
            this.$router.push({
                path: YimUrls.requestIloqIdentifierUrl(this.type, this.personId)
            });
        }
        else if (this.technologyType === CredentialTechnologyType.QRCode)
        {
            this.$router.push({
                path: YimUrls.requestQrCodeIdentifierUrl(this.type, this.personId)
            });
        }
        else
        {
            this.$router.push({
                path: YimUrls.requestIdentifierUrl(this.type, this.personId)
            });
        }
    }

    onLinkUnlinkAction($event: Event): void
    {
        $event.stopPropagation();
        // UnLink only possible when an identifier is present
        // Link only possible when no identifier request is active
        // Be aware that link unlink is currently not depending on the type of identifier!
        if (this.hasIdentifier === true)
        {
            this.$router.push({
                path: YimUrls.requestUnlinkIdentifier(this.type, this.personId, this.identifierId)
            });
        }
        else
        {
            this.$router.push({
                path: YimUrls.requestLinkIdentifier(this.type, this.personId)
            });
        }
    }

    onEditAction($event: Event): void
    {
        $event.stopPropagation();
        if (this.technologyType === CredentialTechnologyType.Print)
        {
            this.$router.push({
                path: YimUrls.requestIdentifierPrintEditUrl(this.type, this.requestId)
            });
        }
        else if (this.technologyType === CredentialTechnologyType.IloqS5Key)
        {
            this.$router.push({
                path: YimUrls.requestIdentifierIloqEditUrl(this.type, this.requestId)
            });
        }
        else if (this.technologyType === CredentialTechnologyType.QRCode)
        {
            this.$router.push({
                path: YimUrls.requestIdentifierQrCodeEditUrl(this.type, this.requestId)
            });
        }
        else
        {
            this.$router.push({
                path: YimUrls.requestIdentifierEditUrl(this.type, this.requestId)
            });
        }
    }

    onShowConfirmModal($event: Event): void
    {
        $event.stopPropagation();
        this.showConfirmModal = true;
    }

    onViewDetailsAction($event: Event): void
    {
        $event.stopPropagation();
        this.$emit('view-details', this.requestId);
    }

    async toggleMenu(): Promise<void>
    {
        if (IdentifierActions.openMenuInstance && IdentifierActions.openMenuInstance !== this)
        {
            IdentifierActions.openMenuInstance.closeMenu();
        }

        if (this.showMenu)
        {
            this.closeMenu();
            return;
        }

        this.showMenu = true;
        IdentifierActions.openMenuInstance = this;

        this.menuPosition = null;
        this._attachViewportListeners();

        await this.$nextTick();
        this._recomputeMenuPosition();
    }

    closeMenu(): void
    {
        this.showMenu = false;

        this.menuPosition = null;
        this._detachViewportListeners();

        if (IdentifierActions.openMenuInstance === this)
        {
            IdentifierActions.openMenuInstance = null;
        }
    }

    beforeUnmount(): void
    {
        this._detachViewportListeners();

        if (IdentifierActions.openMenuInstance === this)
        {
            IdentifierActions.openMenuInstance = null;
        }
    }

    private _attachViewportListeners(): void
    {
        if (this._viewportListenersAttached)
        {
            return;
        }

        window.addEventListener('resize', this._onViewportChanged);
        window.addEventListener('scroll', this._onViewportChanged, true);
        this._viewportListenersAttached = true;
    }

    private _detachViewportListeners(): void
    {
        if (!this._viewportListenersAttached)
        {
            return;
        }

        window.removeEventListener('resize', this._onViewportChanged);
        window.removeEventListener('scroll', this._onViewportChanged, true);
        this._viewportListenersAttached = false;
    }

    private _getElementFromVueRef(refValue: unknown): HTMLElement | null
    {
        if (refValue instanceof HTMLElement)
        {
            return refValue;
        }

        if (!refValue || typeof refValue !== 'object')
        {
            return null;
        }

        const maybeVue = refValue as { $el?: unknown };
        return (maybeVue.$el instanceof HTMLElement) ? maybeVue.$el : null;
    }

    private _recomputeMenuPosition(): void
    {
        const actionsButtonEl = this._getElementFromVueRef(this.$refs.actionsButton);
        const actionsMenuEl = this._getElementFromVueRef(this.$refs.actionsMenuRoot);

        if (!actionsButtonEl || !actionsMenuEl)
        {
            return;
        }

        const buttonRect = actionsButtonEl.getBoundingClientRect();
        const menuRect = actionsMenuEl.getBoundingClientRect();

        const gap = 4;
        const margin = 8;

        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        const openUp = spaceBelow < menuRect.height && spaceAbove > spaceBelow;

        let top = openUp ?
            buttonRect.top - menuRect.height - gap :
            buttonRect.bottom + gap;

        let left = buttonRect.right - menuRect.width;

        left = Math.max(margin, Math.min(left, window.innerWidth - menuRect.width - margin));
        top = Math.max(margin, Math.min(top, window.innerHeight - menuRect.height - margin));

        this.menuPosition = { top, left };
    }
}
