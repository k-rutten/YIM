import { Component, mixins } from 'vue-facing-decorator';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { ToastNotification } from 'yim-common/src/models/models';
import { useToastsStore } from 'yim-common/src/store/toasts-module';

@Component
export default class Authorization extends mixins(BaseMixin)
{
    private readonly _toastsStore = useToastsStore();

    openNotification(event: ToastNotification): void
    {
        this._toastsStore.showToastAction({ text: event.text, type: event.type });
    }
}
