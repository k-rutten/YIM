import { Component, mixins } from 'vue-facing-decorator';
import { registrationApiService } from '@src/services';
import PersonDossierMixin from '@src/utils/mixins/person-dossier-mixin';
import BaseMixin from '@src/utils/mixins/base-mixin';
import { WebPermission } from '@src/models/generated/registration';
import { AccessControl } from '@src/utils/access-control';

@Component
export default class PersonSyncAction extends mixins(PersonDossierMixin, BaseMixin)
{
    timeoutId : number | undefined;

    get isAdministrator(): boolean
    {
        return AccessControl.hasPermission(WebPermission.YimConfiguratorPermission);
    }

    async debounceSynchronizePerson(): Promise<void>
    {
        if (this.timeoutId)
        {
            clearTimeout(this.timeoutId);
        }
        else
        {
            await this.synchronizePerson();
        }

        this.timeoutId = setTimeout(() =>
        {
            this.timeoutId = undefined;
        }, 1000);
    }

    async synchronizePerson(): Promise<void>
    {
        const response = await registrationApiService.synchronizePerson(this.personId);

        if (response.isSuccess)
        {
            this.showServiceSuccess('PersonSynchronized');
        }
        else if (!response.isSuccess && response.firstError())
        {
            this.showError(response.firstError());
        }
    }
}
