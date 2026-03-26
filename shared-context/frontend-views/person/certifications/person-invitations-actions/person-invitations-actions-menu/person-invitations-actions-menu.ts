import { Component, Vue, Prop } from 'vue-facing-decorator';
import { PersonElearningInvitationResource, RegistrationActionTypes } from '@src/models/generated/registration';
import { useDossierStore } from '@src/store/dossier-module';

@Component
export default class PersonInvitationsActionsMenu extends Vue
{
    private readonly _dossierStore = useDossierStore();

    @Prop({ default: null })
    menuPosition!: { top: number; left: number } | null;

    @Prop()
    showMenu!: boolean;

    @Prop()
    source!: PersonElearningInvitationResource;

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

    hasExamAddAttemptPermission(): boolean
    {
        return this._dossierStore.currentPerson.registrationActionTypes.includes(RegistrationActionTypes.ExamAddAttempt) ?? false;
    }

    hasExamManuallyPassPermission(): boolean
    {
        return this._dossierStore.currentPerson.registrationActionTypes.includes(RegistrationActionTypes.ExamManuallyPass) ?? false;
    }

    disableActionItem(feature: string): boolean
    {
        return !(this.source &&
            this.isActive(this.source.validUntillUtc) &&
            this.isFeatureEnabled(feature));
    }

    isActive(validUntil: Date | null) : boolean
    {
        return validUntil !== null && validUntil.getTime() > Date.now();
    }

    isFeatureEnabled(feature: string): boolean
    {
        return this.source.features?.[feature] === true;
    }

    areYouSureToAddExamAttempt(): void
    {
        this.$emit('exam-add-attempt-clicked');
    }

    areYouSureToManuallyPassExam(): void
    {
        this.$emit('exam-manually-pass-clicked');
    }
}
