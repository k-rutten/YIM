import { Vue, Prop, Component } from 'vue-facing-decorator';
import { registrationApiService } from '@src/services';
import { useToastsStore } from 'yim-common/src/store/toasts-module';
import { PersonElearningInvitationResource, RegistrationActionTypes } from '@src/models/generated/registration';
import { ToastTypes } from 'yim-common/src/models/models';
import { useDossierStore } from '@src/store/dossier-module';
import { AppHost } from 'yim-common/src/abstractions/app-host';

interface IMenuPosition { top: number; left: number }

@Component
export default class PersonInvitationsActions extends Vue
{
    private readonly _dossierStore = useDossierStore();
    private readonly _toastsStore = useToastsStore();

    @Prop()
    personId!: string;

    @Prop()
    source!: PersonElearningInvitationResource;

    showActionMenu = false;
    showExamAttemptModal = false;
    showExamManuallyPassModal = false;

    menuPosition: IMenuPosition | null = null;

    private readonly _onViewportChanged = (): void =>
    {
        this.hideAnyActionsMenu();
    };

    private _viewportListenersAttached = false;

    hasExamAddAttemptPermission(): boolean
    {
        return this._dossierStore.currentPerson.registrationActionTypes.includes(RegistrationActionTypes.ExamAddAttempt) ?? false;
    }

    hasExamManuallyPassPermission(): boolean
    {
        return this._dossierStore.currentPerson.registrationActionTypes.includes(RegistrationActionTypes.ExamManuallyPass) ?? false;
    }

    examAddAttemptClicked(): void
    {
        if (this.hasExamAddAttemptPermission())
        {
            this.showExamAttemptModal = true;
        }
    }

    examManuallyPassClicked(): void
    {
        if (this.hasExamManuallyPassPermission())
        {
            this.showExamManuallyPassModal = true;
        }
    }

    async toggleActionsMenu(): Promise<void>
    {
        if (this.showActionMenu)
        {
            this.hideAnyActionsMenu();
            return;
        }

        this.showActionMenu = true;
        this.menuPosition = null;
        this._attachViewportListeners();

        await this.$nextTick();
        this._recomputeMenuPosition();
    }

    hideAnyActionsMenu(): void
    {
        this.showActionMenu = false;
        this.menuPosition = null;
        this._detachViewportListeners();
    }

    beforeUnmount(): void
    {
        this._detachViewportListeners();
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

        const maybeVue = refValue as { $el?: unknown; $refs?: Record<string, unknown> };
        const maybeRootRef = maybeVue.$refs?.actionsMenuRoot;
        if (maybeRootRef instanceof HTMLElement)
        {
            return maybeRootRef;
        }

        return (maybeVue.$el instanceof HTMLElement) ? maybeVue.$el : null;
    }

    private _recomputeMenuPosition(): void
    {
        const actionsButtonEl = this._getElementFromVueRef(this.$refs.actionsButton);
        const actionsMenuEl = this._getElementFromVueRef(this.$refs.actionsMenu);

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

    async examAddTry(): Promise<void>
    {
        if (this.hasExamAddAttemptPermission())
        {
            const response = await registrationApiService.examAddTry(this.personId, this.source.invitationId);

            if (!response.isSuccess)
            {
                for (const error of Object.values(response.errors))
                {
                    await this._toastsStore.showToastAction({ text: error.join('; ') as string, type: ToastTypes.error, duration: 7000 });
                }
            }

            this.showExamAttemptModal = false;
        }
        else
        {
            await this._toastsStore.showToastAction({ text: AppHost.i18n.global.t('UserHasNoPermission') as string, type: ToastTypes.warning, duration: 7000 });
        }
    }

    async examForceCompletion(): Promise<void>
    {
        if (this.hasExamManuallyPassPermission())
        {
            const response = await registrationApiService.examForceCompletion(this.personId, this.source.invitationId);

            if (!response.isSuccess)
            {
                for (const error of Object.values(response.errors))
                {
                    await this._toastsStore.showToastAction({ text: error.join('; ') as string, type: ToastTypes.error, duration: 7000 });
                }
            }

            this.showExamManuallyPassModal = false;
        }
        else
        {
            await this._toastsStore.showToastAction({ text: AppHost.i18n.global.t('UserHasNoPermission') as string, type: ToastTypes.warning, duration: 7000 });
        }
    }
}
