import { AuthorizationMemberListResource } from '@src/models/generated/registration';
import { Component, mixins, Prop, Watch } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { DialogActionsBar } from '@progress/kendo-vue-dialogs';
import cloneDeep from 'lodash/cloneDeep';
import { formatYimDate } from 'yim-common/src/utils/filters/dates/format';
import { Form } from 'vee-validate';

@Component({
    components: {
        DialogActionsBar,
        Form
    },
    emits: ['save']
})

export default class AccessChangeDate extends mixins(BaseMixin)
{
    @Prop()
    show!: boolean;

    @Prop()
    isSaving!: boolean;

    @Prop()
    selectedPersonAuthorizations!: AuthorizationMemberListResource[];

    @Prop()
    selectedAll!: boolean;

    toUpdatePersonAuthorizations: AuthorizationMemberListResource[] = [];

    getFormat(date: Date | null): string
    {
        if (date === null)
        {
            return '';
        }

        return formatYimDate(date);
    }

    @Watch('selectedPersonAuthorizations')
    updateSelectedPersonAuthorizations(): void
    {
        this.toUpdatePersonAuthorizations = cloneDeep(this.selectedPersonAuthorizations);
    }

    async save(): Promise<void>
    {
        this.disableActionButton();

        const validationResult = await this.validate();
        if (!validationResult.valid)
        {
            this.enableActionButton();
            return;
        }

        this.$emit('save', this.toUpdatePersonAuthorizations);
        this.enableActionButton();
    }
}
